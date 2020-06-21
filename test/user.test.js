const request = require('supertest');
const app = require('../source/app')
const User = require('../source/models/user')
const {setUpDatabase, existingUser, userOneId} = require('./fixtures/db')

const nonExistingUser = {
    name: 'fake',
    email: 'fake@example.com',
    password: '123456'
}

//setUp jest... before running test do this
beforeEach( setUpDatabase)

//instead of postman testing we can try like unit test
test('Should sign up a new user', async ()=>{
    const response = await request(app)
        .post('/users')
        .send({
            name: 'john',
            email: 'kiminlee0505@gmail.com',
            password: '123456'
        }).expect(201)

    const user = await User.findById(response.body.user._id);
    
    //check the mongodb
    expect(user).not.toBeNull();
    expect(response.body.user).toMatchObject({
        name: 'JOHN',
        email: 'kiminlee0505@gmail.com'
    })
})

test('Should login user with exisiting user', async()=>{
    const response = await request(app)
        .post('/users/login')
        .send({
            email: existingUser.email,
            password: existingUser.password
        }).expect(200);


    // when saving the user, the first token will be created and then the seconde will be created after log in
    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login with non-existing user', async()=>{
    await request(app)
        .post('/users/login')
        .send({
            email: nonExistingUser.email,
            password: nonExistingUser.password
        }).expect(400)
})

test('Should get profile user with token', async()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should upload image to profile', async ()=>{
    const response = await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .attach('avatar', 'test/fixtures/profile-pic.jpg')
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should delete account for user', async()=>{
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send()
        .expect(200)

    // check if user is removed from database correctly ... kinda double check
    const user = await User.findById(userOneId);

    expect(user).toBeNull()
})

test('Should not get account without authentication', async()=>{
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should update valid user', async () =>{
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send({
            name: 'changing'
        })
        .expect(200)

    const user = await User.findById(response.body._id);
    expect(user.name).toBe('changing'.toUpperCase())
})

test('Should not update with invalid field', async () =>{
    request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send({
            location: 'somewhere'
        })
        .expect(400)
})
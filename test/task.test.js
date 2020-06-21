const request = require('supertest');
const app = require('../source/app')
const Task = require('../source/models/task');
const {setUpDatabase, existingUser, existingUserTwo,taskOne, userOneId} = require('./fixtures/db')


beforeEach(setUpDatabase)

test('Should create task for user', async()=>{  
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}` )
        .send({
            description: "this is my test"
        })
        .expect(201);

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false)
})

test('Should get all tasks for user one',async ()=>{
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send()
        .expect(200);

    expect(response.body.length).toEqual(2);
})

test('Should delete task', async ()=>{
    const response = await request(app)
        .delete(`/tasks/:${taskOne._id}`)
        .set('Authorization', `Bearer ${existingUserTwo.tokens[0].token}`)
        .send()
        .expect(404)

    expect(response.body).not.toBeNull
})
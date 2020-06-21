const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const User = require('../../source/models/user')
const Task = require('../../source/models/task')

const userOneId = new mongoose.Types.ObjectId()

const existingUser = {
    _id : userOneId,
    name: 'mike',
    email: 'mike@example.com',
    password: '123456',
    tokens:[{
        token: jwt.sign({_id: userOneId.toString()},process.env.JWT_TOKEN)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const existingUserTwo = {
    _id : userTwoId,
    name: 'Andrew',
    email: 'Andrew@example.com',
    password: '123456',
    tokens:[{
        token: jwt.sign({_id: userTwoId.toString()},process.env.JWT_TOKEN)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'second task',
    completed: false,
    owner : userOneId._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'third task',
    completed: true,
    owner : userTwoId._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First task',
    completed: true,
    owner : userOneId._id
}

const setUpDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await User(existingUser).save();
    await User(existingUserTwo).save();
    await Task(taskOne).save()
    await Task(taskTwo).save()
    await Task(taskThree).save()
}

module.exports={
    existingUser,
    userOneId,
    existingUserTwo,
    setUpDatabase,
    taskOne
}
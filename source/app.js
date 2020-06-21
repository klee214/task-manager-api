const express = require('express');
require('./db/mongoose');
const taskRouter = require('./router/task')
const userRouter = require('./router/user')

const app = express();

app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

module.exports=app
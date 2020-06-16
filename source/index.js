const express = require('express');
const result = require('dotenv').config({path: './config/key.env'})
require('./db/mongoose');
const taskRouter = require('./router/task')
const userRouter = require('./router/user')

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

app.listen(PORT,()=>{
    console.log(`server ${PORT} is connected`);
});

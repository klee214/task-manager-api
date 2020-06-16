const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.post('/tasks', auth, async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    
    try{
        await task.save()
        res.status(201).send(task);
    }catch(e){
        res.status(400).send(e)
    }

    // task.save().then(result=>{
    //     res.status(201).send(result)
    // }).catch(err=>{
    //     res.status(400).send(err)
    // })
})


// GET /tasks?completed=true 
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:desc 
router.get('/tasks', auth ,async (req,res)=>{
    const match = {};
    const sort = {};

    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }


    if(req.query.sortBy){
        const createdAt = req.query.sortBy.split(':')[0];
        const ascDesc = req.query.sortBy.split(':')[1];

        sort[createdAt] = ascDesc === 'asc' ? 1 : -1;
    }

    try{
        // const task = await Task.find({owner: req.user._id});
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);

    }catch(err){
        res.status(500).send(err.toString())
    }

    // Task.find().then(tasks=>{
    //     res.send(tasks);
    // }).catch(err=>{
    //     res.send(500).send(err);
    // })
})

router.get('/tasks/:id', auth , async (req,res)=>{

    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if(!task){
            return res.status(404).send()
        }
        res.status(201).send(task)

    }catch(err){
        res.status(500).send(err)
    }

    // Task.findById(req.params.id).then(task=>{
    //     if(!task){
    //         return res.status(404).send();
    //     }
    //     res.send(task)
    // }).catch(err=>{
    //     res.send(err);
    // })
})

router.patch('/tasks/:id', auth, async (req,res)=>{
    const reqBody = Object.keys(req.body);
    const updatedModel = ["completed", "description"];

    const isValid = reqBody.every(single => updatedModel.includes(single));

    if(!isValid){
        return res.status(400).send('error : invalid updates')
    }

    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        
        if(!task){
            return res.send(404).send()
        }

        reqBody.forEach(index => {
            task[index] = req.body[index];
        });

        task.save();

        res.send(task);
    }catch(err){
        res.status(400).send(err)
    }
})

router.delete('/tasks/:id', auth ,async (req,res)=>{
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});

        if(!task){
            return res.status(404).send();
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e);
    }
})

module.exports = router
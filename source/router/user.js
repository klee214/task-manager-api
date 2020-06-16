const express = require('express');
const router = new express.Router();
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user');
const auth = require('../middleware/auth')
const {sendCancelEmail,sendWelcomeEmail} = require('../email/account')

router.post('/users', async (req,res)=>{
    const user = new User(req.body)
    console.log(req.body.name)

    try{
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        const token = user.generateAuthToken();
        res.status(201).send(user).send(token);
    }catch(e){
        if(e.code == 11000){
            console.log('existing email account')
        }
        res.status(400).send(e);
    }

    // user.save().then(result=>{
    //     res.status(201).send(result);
    // }).catch(err=>{
    //     res.status(400);
    //     res.send(err)
    // })
})

router.post('/users/login', async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.send({user, token})
    }catch(e){
        res.status(400).send(e);
    }
})

router.post('/users/logout', auth, async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token=>{
            return token.token !== req.token
        })

        await req.user.save();
        res.send()
    }catch(e){
        res.status(500).send();
    }
})

router.post('/users/logoutAll', auth, async (req,res)=>{
    try{    
        req.user.tokens = [];

        await req.user.save()
        res.send();
    }catch(e){
        res.status(500).send(e);
    }
})

// multer file uploading and deleting
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, files, cb){
        if(!files.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Only jpg, jpeg or png'));
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), (err, req, res, next) => {
    res.status(400).send({error: err.message})
},(req, res)=>{
    const buffer = sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    // req.user.avatar = req.file.buffer;

    req.user.avatar = buffer
    console.log(req.file)
    res.send();
})

router.get('/users/me', auth ,async (req,res)=>{

    res.send(req.user);
})

router.get('/users/:id/avatar', async (req, res)=>{
    try{
        const user = await User.findById(req.params.id);
        
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    }catch(e){
        res.status(404).send()
    }
})

router.patch('/users/me', auth, async (req,res)=>{
    const reqBody = Object.keys(req.body);
    const userObject = ["name", "email", "password", "age"];
    const isValid = reqBody.every(reqBody=>userObject.includes(reqBody));
    
    if (!isValid){
        return res.status(400).send('error : invalid updates')
    }

    try{
        // const user = await User.findById(req.user._id);
        
        // if(!user){
        //     return res.send(404).send()
        // }

        reqBody.forEach(index => {
            req.user[index] = req.body[index]; 
        });
        
        await req.user.save();
        res.send(req.user)

    }catch(err){
        res.status(400).send(err)
    }
})

router.delete('/users/me',auth, async(req,res)=>{
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
        
        // if(!user){
        //     return res.status(404).send();
        // }

        await sendCancelEmail(req.user.email, req.user.name);
        await req.user.remove();
        
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/users/me/avatar', auth, async (req, res)=>{

    req.user.avatar = undefined;
    await req.user.save()
    res.send();
})

// router.get('/users/:id',async (req,res)=>{

//     try{
//         const user = await User.findById(req.params.id);
//         if(!user){
//             return res.status(404).send();
//         }
//         res.status(201).send(user)
//     }catch(e){
//         res.status(500).send(e);
//     }
// })

module.exports = router
const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const Task = require('../models/task')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        validate(value){
            if(!validator.isAlpha(value)){
                throw new Error('This is alpha only')
            }
        }
    },
    email:{
        type:String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('This is error email only')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(validator.contains(value.toUpperCase(), 'password'.toUpperCase()) || value.length < 6){
                throw new Error('This is the password error')
            }
        }
    },
    age:{
        type: Number,
        validate(value){
            if(value < 0){
                throw new Error('This is error over 0');
            }
        }
    },
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})

// make a relation with Task,
// make virtually a tasks property inside of User Schema -just like owner in Task-
userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
})

// whenever send json to web browser it will automatically stringfy to json, so whenever it trigger it will occur
userSchema.methods.toJSON = function(){
    const user = this;
    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.tokens;
    delete userObj.avatar;

    return userObj;
}

// custom Schema middleware function -login -> create toekn-
userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_TOKEN,{expiresIn: '3 days'})
    
    user.tokens.push({token});
    await user.save();

    return token;
}

// to check bcrypt password middleware function
userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email});

    if(!user){
        throw new Error('unable to login');
    }

    const passVal = await bcrypt.compare(password, user.password)

    if(!passVal){
        throw new Error('unable to login');
    }

    return user;
}

// pre middleware function for query save
userSchema.pre('save', async function(next){
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

//pre middleware function for remove query
userSchema.pre('remove', async function(next){
    const user = this;

    await Task.deleteMany({owner: user._id})
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User
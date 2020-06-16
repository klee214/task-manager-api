const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trime: true
    },
    completed: {
        type: Boolean,
        default: false
    },

    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps: true
})

taskSchema.pre('save', async function(next){

    console.log("task pre function");

    next();
})

const Tasks = mongoose.model('Tasks', taskSchema);

module.exports = Tasks;
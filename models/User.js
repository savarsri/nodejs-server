const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email:{
        type:String,
        required: true,
        lowercase: true,
        immutable: true,
    },
    age:{
        type: Number
    },
    password:{
        type:String,
        required: true,
    },
    teams: {
        type: [String],
    }
}, {timestamps: true})

const User = mongoose.model('User', userSchema)
module.exports = User
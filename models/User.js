const mongoose = require('mongoose')
const Schema = mongoose.Schema

// User Schema defined

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
    password:{
        type:String,
        required: true,
    },
    teams: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'Team'
    }
}, {timestamps: true})

const User = mongoose.model('User', userSchema)
module.exports = User
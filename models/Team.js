const mongoose = require('mongoose')
const Schema = mongoose.Schema

const assignmentSchema = new Schema({
    name: {
        type: String,
        maxLength: 50,
        minLength: 1,
        required: true,
    },
    description: {
        type: String,
        maxLength: 250,
        minLength: 0,
        required: true,
    },
    createdAt: {
        type: Date,
        required:true,
        immutable: true,
        default: () => Date.now(),
    },
    dueDate: {
        type: Date,
        required: true,
    },
    submittedBy: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
        ref: "User",
    },
    notSubmittedBy: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
        ref: "User",
    },
    grade: {
        type: Number,
    },
    returnedGrade: [{
        user: mongoose.SchemaTypes.ObjectId,
        grade: Number,
    }]
    
})

const postSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    channel: {
        type: String,
        required: true,
    },
    attachments:{
        name: String,
        fileType: String,
        size: Number,
    },
    createdBy: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "User",
        immutable: true,
    },
},{timestamps: true})

const channelSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    posts: [postSchema],
    
})

const teamSchema = new Schema({
    name: {
        type: String,
        maxLength: 50,
        minLength: 1,
        required: true,
        immutable: true,
    },
    createdBy: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "User",
        immutable: true,
    },
    code: {
        type: String,
        length: 6,
        required: true,
        immutable: true
    },
    admin: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
        ref: "User",
    },
    channels: [channelSchema],
    members: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: "User",
    },
    assignment: [assignmentSchema],
},{timestamps: true})

const Team = mongoose.model('Team' , teamSchema)
module.exports = Team
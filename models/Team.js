const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Post Schema defined for Team

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

// Channel Schema defined for Team

const channelSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    posts: [postSchema],

})

// Team schema defined

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
    assignment: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'Assignment',
    },
},{timestamps: true})

const Team = mongoose.model('Team' , teamSchema)
module.exports = Team
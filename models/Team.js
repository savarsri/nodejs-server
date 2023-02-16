const mongoose = require('mongoose')
const Schema = mongoose.Schema

const teamSchema = new Schema({
    name: {
        type: String,
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
        required: true,
        immutable: true
    },
    admin: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
        ref: "User",
    },
    channels: [String],
    members: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: "User",
    },
},{timestamps: true})

const Team = mongoose.model('Team' , teamSchema)
module.exports = Team
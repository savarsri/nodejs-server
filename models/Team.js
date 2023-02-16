const mongoose = require('mongoose')
const Schema = mongoose.Schema

const teamSchema = new Schema({
    name: String,
    createdBy: String,
    code: String,
    admin: [mongoose.SchemaTypes.ObjectId],
    channels: [String],
    members: [mongoose.SchemaTypes.ObjectId],
},{timestamps: true})

const Team = mongoose.model('Team' , teamSchema)
module.exports = Team
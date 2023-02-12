const mongoose = require('mongoose')
const Schema = mongoose.Schema

const teamSchema = new Schema({
    name: {
        type: String
    },
    createdBy: {
        type: String
    },
},{timestamps: true})

const Team = mongoose.model('Team' , teamSchema)
module.exports = Team
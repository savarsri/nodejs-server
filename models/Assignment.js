const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Assignment Schema defined for Team

const assignmentSchema = new Schema({
    team:{
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'Team'
    },
    title: {
        type: String,
        maxLength: 50,
        minLength: 1,
        required: true,
    },
    description: {
        type: String,
        maxLength: 250,
        minLength: 0,
    },
    createdAt: {
        type: Date,
        required:true,
        immutable: true,
        default: () => Date.now(),
    },
    dueDate: {
        type: Date,
        default: () => Date.now(),
        required: true,
    },
    submittedBy: {
        type: [mongoose.SchemaTypes.ObjectId],
        // required: true,
        ref: "User",
    },
    notSubmittedBy: {
        type: [mongoose.SchemaTypes.ObjectId],
        // required: true,
        ref: "User",
    },
    grade: {
        type: Number,
    },
    returnedGrade: [{
        user: mongoose.SchemaTypes.ObjectId,
        grade: Number,
    }]
    
});

const Assignment = mongoose.model('Assignment' , assignmentSchema)
module.exports = Assignment;
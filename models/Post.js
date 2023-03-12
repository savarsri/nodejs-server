// const mongoose = require('mongoose')
// const Schema = mongoose.Schema

// // Post Schema defined for Team

// const postSchema = new Schema({
//     content: {
//         type: String,
//         required: true,
//     },
//     channel: {
//         type: mongoose.SchemaTypes.ObjectId,
//         required: true,
//     },
//     attachments:{
//         name: String,
//         fileType: String,
//         size: Number,
//     },
//     createdBy: {
//         type: mongoose.SchemaTypes.ObjectId,
//         required: true,
//         ref: "User",
//         immutable: true,
//     },
// },{timestamps: true})

// const Post = mongoose.model('Post' , postSchema)
// module.exports = Post
const express = require('express');
const router = express.Router();

const PostController = require('../controller/PostController')

// Assignment functions router set-up 

router.post('/createPost', PostController.createAssignment)
router.post('/updatePost', PostController.updateAssignment)
router.post('/deletePost', PostController.deleteAssignment)

module.exports = router 

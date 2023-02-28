const express = require('express');
const router = express.Router();

const AssignmentController = require('../controller/AssignmentController')

// Assignment functions router set-up 

router.post('/createAssignment', AssignmentController.createAssignment)

module.exports = router 

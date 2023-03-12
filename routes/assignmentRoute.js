const express = require('express');
const router = express.Router();

const AssignmentController = require('../controller/AssignmentController')

// Assignment functions router set-up 

router.post('/createAssignment', AssignmentController.createAssignment)
router.post('/updateAssignment', AssignmentController.updateAssignment)
router.post('/deleteAssignment', AssignmentController.deleteAssignment)

module.exports = router 

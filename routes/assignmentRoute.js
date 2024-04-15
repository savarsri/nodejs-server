const express = require('express');
const router = express.Router();

const AssignmentController = require('../controller/AssignmentController');
const { upload } = require('../middleware/upload');

// Assignment functions router set-up 

router.post('/getAssignment', AssignmentController.getAssignment) //done
router.get('/assignments', AssignmentController.getAllAssignments) //done
router.put('/updateAssignment', AssignmentController.updateAssignment)
router.post('/deleteAssignment', AssignmentController.deleteAssignment)
router.put('/unSubmitAssignment', AssignmentController.unSubmitAssignment) //done

module.exports = router 

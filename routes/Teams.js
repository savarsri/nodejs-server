const express = require('express');
const router = express.Router();

const TeamsController = require('../controller/TeamsController')

router.get('/getTeams', TeamsController.getTeams)
router.post("/createTeams" , TeamsController.createTeams)
router.post('joinTeams' , TeamsController.joinTeams)

module.exports = router 

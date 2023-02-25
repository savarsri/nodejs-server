const express = require('express');
const router = express.Router();

const TeamsController = require('../controller/TeamsController')

router.post('/getTeams', TeamsController.getTeams)
router.post("/createTeams" , TeamsController.createTeams)
router.post('/joinTeam' , TeamsController.joinTeam)
router.post('/teamDetails' , TeamsController.getTeamDetails)
router.post('/teamFiles' , TeamsController.getTeamFiles)
router.post('/teamAssignments' , TeamsController.getTeamAssignments)

module.exports = router 

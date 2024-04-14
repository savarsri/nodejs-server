const express = require('express');
const router = express.Router();

const TeamsController = require('../controller/TeamsController')

// Teams functions router set-up 

router.post('/getTeams', TeamsController.getTeams)
router.post("/createTeams" , TeamsController.createTeams)
router.put('/joinTeam' , TeamsController.joinTeam)
router.put('/addMember' , TeamsController.addmember)
router.delete('/removeMember' , TeamsController.removeMember)
router.post('/teamDetails' , TeamsController.getTeamDetails)
router.post('/teamPosts' , TeamsController.getTeamPosts)
router.post('/teamFiles' , TeamsController.getTeamFiles)
router.post('/teamAssignments' , TeamsController.getTeamAssignments)
router.post('/teamMembers' , TeamsController.getTeamMembers)

module.exports = router 

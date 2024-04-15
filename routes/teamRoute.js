const express = require('express');
const router = express.Router();

const TeamsController = require('../controller/TeamsController')

// Teams functions router set-up 

router.post('/getTeams', TeamsController.getTeams) //done
router.post("/createTeams" , TeamsController.createTeams) //done
router.put('/joinTeam' , TeamsController.joinTeam) //done
router.put('/addMember' , TeamsController.addmember) //done
router.delete('/removeMember' , TeamsController.removeMember) //done
router.post('/teamDetails' , TeamsController.getTeamDetails)
router.post('/teamPosts' , TeamsController.getTeamPosts) //done
router.post('/teamFiles' , TeamsController.getTeamFiles) //done
router.post('/teamAssignments' , TeamsController.getTeamAssignments) //done
router.post('/teamMembers' , TeamsController.getTeamMembers) //done

module.exports = router 

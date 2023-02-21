const Team = require('../models/Team')

const getTeams = (req , res, next) => {
    
}

const createTeams = (req , res) => {
    let team = new Team({
        name: req.body.name,
        createdBy: req.body.uid,
        admin: req.body.uid,
        code: req.body.code,
    })
    team.save()
        .then(team => {
            res.status(200).json({
                code: 200,
                team,
                message: "Team created successfully"
            })
            delete(team);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                code: 500,
                error,
                message: 'error occured'
            })
            delete(team);
        })
}

const joinTeam = (req , res) => {
    
}

const getTeamDetails = (req,res)=>{

}

const getTeamAssignments = (req,res)=>{

}

const getTeamFiles = (req,res) => {

}



module.exports = {getTeams,joinTeam,createTeams,getTeamDetails,getTeamAssignments,getTeamFiles}
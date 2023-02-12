const Team = require('../models/Team')

const getTeams = (req , res, next) => {

}

const createTeams = (req , res, next) => {
    let team = new Team({
        name: req.body.name,
        createdBy: req.body.createdBy,
    })
    team.save()
        .then(user => {
            res.status(200).json({
                code: 200,
                user,
                message: "Team created successfully"
            })
        })
        .catch(error => {
            res.status(500).json({
                code: 500,
                error,
                message: 'error occured'
            })
        })
}

const joinTeams = (req , res, next) => {
    
}

module.exports = {getTeams,joinTeams,createTeams}
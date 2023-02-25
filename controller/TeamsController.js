const Team = require("../models/Team");
const User = require("../models/User");

const getTeams = async (req, res) => {
    let uid = req.body.uid;
    let userTeamsID= [];
    User.findById(uid).then((user)=>{
        userTeamsID = [...user.teams];
    }).catch((error)=>{
        console.log(error);
    });

    let userTeams=[];
    for (let index = 0; index < userTeamsID.length; index++) {
        await Team.findById(userTeamsID[index]).then((team)=>{
            userTeams=[...userTeams,{
                _id: team.id,
                name: team.name,
                channels: team.channels
            }]
            console.log("hello");
        }).catch((error)=>{
            console.log(error);
            res.status(500).json({
                code: 500,
                error: "Cannot retrieve teams!"
            });
            return;
        })

        console.log("how");
    }

    console.log("bye");
    res.status(200).json(userTeams);

}

const createTeams = (req, res) => {
  let uid = req.body.uid;
  let team = new Team({
    name: req.body.name,
    createdBy: uid,
    admin: uid,
    code: req.body.code,
  });
  team
    .save()
    .then((team) => {
      User.findByIdAndUpdate(req.body.uid, { $push: { teams: team._id } })
        .then((data) => {
          // Do something with data
        })
        .catch((error) => {
          // Error handling
          team.deleteOne();
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        code: 500,
        error,
        message: "error occured",
      });
      delete team;
    });
};

const joinTeam = (req, res) => {
    let uid = req.body.uid;
    let code = req.body.code;
    Team.findOneAndUpdate({code}, { $push: {members : uid}}).then((team)=>{
        User.findByIdAndUpdate(uid,{ $push:{teams: team._id}})
    })
};

const getTeamDetails = (req, res) => {};

const getTeamAssignments = (req, res) => {};

const getTeamFiles = (req, res) => {};

module.exports = {
  getTeams,
  joinTeam,
  createTeams,
  getTeamDetails,
  getTeamAssignments,
  getTeamFiles,
};

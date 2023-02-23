const Team = require("../models/Team");
const User = require("../models/User");

const getTeams = (req, res) => {};

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
      User.findByIdAndUpdate(
        req.body.uid,
        { "$push":{"teams": team._id} },
      ).then((data)=>{
        console.log(data);
        res.json(data);
        console.log("Data updated!");
      }).catch((error)=>{
        console.log(error);
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

const joinTeam = (req, res) => {};

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

const Team = require("../models/Team");
const User = require("../models/User");

const getTeams = async (req, res) => {
  let uid = req.body.uid;
  let userTeamsID = [];

  // Find list of objectID's of teams the user is in

  await User.findById(uid)
    .then((user) => {
      userTeamsID = user.teams;
    })
    .catch((error) => {
      console.log(error);
    });

    // Fetchs and sends Team details (name,code,channels)

  await Team.find(
    {
      _id: {
        $in: userTeamsID,
      },
    },
    'name code channels -_id',
    function (err, docs) {
      if(err){
        res.status(500).json({
          error: "Error getting teams!",
        })
        return;
      }
      console.log(docs);
      res.status(200).json(docs);
    }
  );
};

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
  Team.findOneAndUpdate({ code }, { $push: { members: uid } }).then((team) => {
    User.findByIdAndUpdate(uid, { $push: { teams: team._id } });
  });
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

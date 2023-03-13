const Team = require("../models/Team");
const User = require("../models/User");
const Assignment = require("../models/Assignment");

const getTeams =  async (req, res) => {
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

  console.log(userTeamsID)

  Team.find(
    {
      _id: {
        $in: userTeamsID,
      },
    },
    "name code channels -_id",
    function (err, docs) {
      if (err) {
        res.status(500).json({
          error: "Error getting teams!",
        });
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
      User.findByIdAndUpdate(req.body.uid, { $push: { teams: team } })
        .then((data) => {
          // Do something with data
          res.status(200).json({
            team
          })
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
    User.findByIdAndUpdate(uid, { $push: { teams: team } });
  });
};

const getTeamDetails = (req, res) => {
  let uid = req.body.uid;
  let code = req.body.code;
  User.findById(uid).then((user) => {
    Team.findOne(
      { code },
      "name code channels admin members id",
      function (err, docs) {
        if (err) {
          res.status(500).json({
            error: "Error getting teams!",
          });
          return;
        }
        if (!user.teams.includes(docs.id, 0)) {
          return;
        }
        if (
          !(
            docs.admin.includes(user.id, 0) || docs.members.includes(user.id, 0)
          )
        ) {
          return;
        }
        res.status(200).json(docs);
      }
    );
  });
};

const getTeamAssignments = (req, res) => {
  let uid = req.body.uid;
  let code = req.body.code;

  User.findById(uid).then((user) => {
    Team.findOne({ code }, "id admin members assignment", function (err, docs) {
      if (err) {
        res.status(500).json({
          error: "Error getting teams!",
        });
        return;
      }
      if (!user.teams.includes(docs.id, 0)) {
        return;
      }
      if (
        !(docs.admin.includes(user.id, 0) || docs.members.includes(user.id, 0))
      ) {
        return;
      }
      let assignments = docs.assignment;
      Assignment.find(
        {
          _id: {
            $in: assignments,
          },
        },
        "title dueDate -_id",
        function (err, docs) {
          if (err) {
            res.status(500).json({
              error: "Error getting teams!",
            });
            return;
          }
          res.status(200).json(docs);
        }
      );
    });
  });
};

const getTeamFiles = (req, res) => {};

module.exports = {
  getTeams,
  joinTeam,
  createTeams,
  getTeamDetails,
  getTeamAssignments,
  getTeamFiles,
};

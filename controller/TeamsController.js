const Team = require("../models/Team");
const Post = require("../models/Post");
const User = require("../models/User");
const Assignment = require("../models/Assignment");

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

  Team.find(
    {
      _id: {
        $in: userTeamsID,
      },
    },
    "name code _id",
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
};

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const createTeams = (req, res) => {
  let uid = req.body.uid;
  code = makeid(6);

  let team = new Team({
    name: req.body.name,
    createdBy: uid,
    admin: uid,
    code: code,
  });
  team
    .save()
    .then((team) => {
      User.findByIdAndUpdate(req.body.uid, { $push: { teams: team } })
        .then((data) => {
          // Do something with data
          res.status(200).json({
            message: "Team Created",
          });
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
  Team.findOneAndUpdate({ code }, { $push: { members: uid } })
    .then((team) => {
      User.findByIdAndUpdate(uid, { $push: { teams: team } })
        .then((data) => {
          res.status(200);
        })
        .catch((error) => {
          res.status(500).json({
            error,
          });
        });
    })
    .catch((error) => {
      res.status(500).json({
        error,
      });
    });
};

const getTeamDetails = (req, res) => {
  let uid = req.body.uid;
  let teamID = req.body.teamID;
  let isAdmin = false;
  User.findById(uid).then((user) => {
    Team.findById(teamID)
      .then((team) => {
        if (!user.teams.includes(team.id, 0)) {
          return;
        }
        if (
          !(
            team.admin.includes(user.id, 0) || team.members.includes(user.id, 0)
          )
        ) {
          return;
        }
        if (team.admin.includes(user.id, 0)) {
          isAdmin = true;
        }
        res.status(200).json({
          name: team.name,
          code: team.code,
          id: team.id,
          isAdmin,
        });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });

    // Team.findById(teamID, "name code admin members id", function (err, docs) {
    //   if (err) {
    //     res.status(500).json({
    //       error: "Error getting teams!",
    //     });
    //     return;
    //   }
    //   if (!user.teams.includes(docs.id, 0)) {
    //     return;
    //   }
    //   if (
    //     !(docs.admin.includes(user.id, 0) || docs.members.includes(user.id, 0))
    //   ) {
    //     return;
    //   }
    //   res.status(200).json(docs);
    // });
  });
};

const getTeamPosts = (req, res) => {
  let uid = req.body.uid;
  let teamID = req.body.teamID;

  User.findById(uid).then((user) => {
    Team.findById(teamID, "id admin members posts", async function (err, docs) {
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
      let posts = docs.posts;
      if(posts == []){
        res.status(200).json({
          posts: [],
        });
      }else{
        let teamPosts = await Post.find(
          {
            _id: {
              $in: posts,
            },
          },
          "content createdBy _id",
        ).populate({ path: "createdBy", select: "name email _id" }).sort({ updatedAt: -1 });
  
        res.status(200).json(teamPosts);
      }
    });
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
  getTeamPosts,
  getTeamAssignments,
  getTeamFiles,
};

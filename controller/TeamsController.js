const Team = require("../models/Team");
const Post = require("../models/Post");
const User = require("../models/User");
const Assignment = require("../models/Assignment");
const File = require("../models/File");
const { application } = require("express");
const filess = require("../middleware/upload");
const fs = require("fs-extra");
const path = require("path");

// Function to retrieve a list of teams a user is part of
const getTeams = async (req, res) => {
  let uid = req.headers.uid;
  let userTeamsID = [];

  // Find the list of object IDs of teams the user is in
  await User.findById(uid)
    .then((user) => {
      userTeamsID = user?.teams;
    })
    .catch((error) => {
      console.log(error);
    });

  // Fetch and send Team details (name, code, channels)
  await Team.find(
    {
      _id: {
        $in: userTeamsID,
      },
    },
    "name code _id createdBy"
  )
    .populate("createdBy", "name")
    .then((teams) => {
      res.status(200).json(teams);
    });
};

// Function to generate a random code
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

// Function to create a new team
const createTeams = (req, res) => {
  let uid = req.headers.uid;
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
      filess.mkdirectory(team.id);
      User.findByIdAndUpdate(uid, { $push: { teams: team } })
        .then((data) => {
          // Do something with data
          res.status(200).json({
            code: 200,
            message: "Team created successfully!",
          });
        })
        .catch((error) => {
          // Error handling
          res.status(500).json(error);
          team.deleteOne();
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        code: 500,
        error,
        message: "error occurred",
      });
      delete team;
    });
};

const joinTeam = (req, res) => {
  let uid = req.headers.uid;
  let code = req.body.code;

  // Check if the user is already a member of the team
  Team.findOne({ code, members: uid })
    .then((existingTeam) => {
      if (existingTeam) {
        return res.status(200).json({
          code: 200,
          message: "You are already a member of this team",
        });
      }

      // If the user is not a member, then proceed to join the team
      Team.findOneAndUpdate({ code }, { $push: { members: uid } })
        .then((team) => {
          // Update user's teams
          User.findByIdAndUpdate(uid, { $push: { teams: team } })
            .then((data) => {
              res.status(200).json({
                code: 200,
                message: "Team Joined",
              });
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
    })
    .catch((error) => {
      res.status(500).json({
        error,
      });
    });
};


// Function to join an existing team
// const joinTeam = (req, res) => {
//   let uid = req.headers.uid;
//   let code = req.body.code;
//   Team.findOneAndUpdate({ code }, { $push: { members: uid } })
//     .then((team) => {
//       User.findByIdAndUpdate(uid, { $push: { teams: team } })
//         .then((data) => {
//           res.status(200).json({
//             code: 200,
//             message: "Team Joined",
//           });
//         })
//         .catch((error) => {
//           res.status(500).json({
//             error,
//           });
//         });
//     })
//     .catch((error) => {
//       res.status(500).json({
//         error,
//       });
//     });
// };

const addmember = (req, res) => {
  let uid = req.headers.uid;
  let teamID = req.body.teamID;
  let member = req.body.member;

  Team.findOne({ _id: teamID })
    .then((team) => {
      if (!team) {
        return res.status(404).json({
          error: "Team not found",
        });
      }

      if (team.admin === uid) {
        return res.status(403).json({
          error: "Admin cannot be added as a member",
        });
      }

      // Check if any of the members to be added already exist in the team
      let existingMembers = team.members.filter((existingMember) =>
        member.includes(existingMember)
      );
      if (existingMembers.length > 0) {
        return res.status(400).json({
          error: "Some members already exist in the team",
        });
      }

      // Add new members to the team
      return Team.findOneAndUpdate(
        { _id: teamID },
        { $addToSet: { members: { $each: member } } }, // Using $addToSet to avoid duplicates
        { new: true }
      ).then((updatedTeam) => {
        // Update user's team associations
        return User.updateMany(
          { _id: { $in: member } },
          { $addToSet: { teams: teamID } }, // Using $addToSet to avoid duplicates
        );
      });
    })
    .then(() => {
      res.status(200).json({
        code: 200,
        message: "Members added successfully.",
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
};




// Function to add a member to a team
// const addmember = (req, res) => {
//   let uid = req.headers.uid;
//   let teamID = req.body.teamID;
//   let member = req.body.member;

//   Team.findOneAndUpdate(
//     { _id: teamID, admin: uid },
//     { $push: { members: member } }
//   )
//     .then((team) => {
//       if (team == null) {
//         res.status(200).json({
//           error: "Team not found",
//         });
//         return;
//       }
//       User.updateMany(
//         { _id: { $in: member } },
//         { $push: { teams: team._id } },
//         function (err, docs) {
//           if (err) {
//             res.status(500).json(err);
//           } else {
//             res.status(200).json({
//               code: 200,
//             });
//           }
//         }
//       );
//     })
//     .catch((error) => {
//       console.log(error);
//       res.status(500).json({
//         error,
//       });
//     });
// };

// Function to remove a member from a team

const removeMember = (req, res) => {
  let uid = req.headers.uid;
  let teamID = req.body.teamID;
  let member = req.body.member;

  // Find the team and check if the user is the admin
  Team.findOne({ _id: teamID, admin: uid })
    .then((team) => {
      if (!team) {
        return res.status(404).json({
          error: "Team not found or you are not the admin of the team",
        });
      }

      // Remove the member(s) from the team
      Team.updateOne(
        { _id: teamID },
        { $pull: { members: { $in: member } } }
      )
        .then(() => {
          // Remove the team from the member(s)'s list of teams
          User.updateMany(
            { _id: { $in: member } },
            { $pull: { teams: teamID } }
          )
            .then(() => {
              res.status(200).json({
                code: 200,
                message: "Members removed successfully",
              });
            })
            .catch((error) => {
              res.status(500).json({
                error: "Failed to remove members from users",
              });
            });
        })
        .catch((error) => {
          res.status(500).json({
            error: "Failed to remove members from team",
          });
        });
    })
    .catch((error) => {
      res.status(500).json({
        error: "Internal server error",
      });
    });
};


// Function to get details of a team
const getTeamDetails = (req, res) => {
  let uid = req.headers.uid;
  let teamID = req.body.teamID;
  let isAdmin = false;

  User.findById(uid).then((user) => {
    Team.findById(teamID)
      .then((team) => {
        if (team?.admin.includes(user.id, 0)) {
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
  });
};

// Function to get posts of a team
const getTeamPosts = (req, res) => {
  let uid = req.headers.uid;
  let teamID = req.body.teamID;
  let isAdmin = false;

  User.findById(uid).then((user) => {
    Team.findById(teamID, "id admin posts", async function (err, docs) {
      if (err) {
        res.status(500).json({
          error: "Error getting teams!",
        });
        return;
      }
      if (docs?.admin.includes(user.id, 0)) {
        isAdmin = true;
      }
      let posts = docs?.posts;
      if (posts == []) {
        res.status(200).json({
          posts: [],
        });
      } else {
        let teamPosts = await Post.find(
          {
            _id: {
              $in: posts,
            },
          },
          "content createdBy _id"
        )
          .populate({ path: "createdBy", select: "name email _id" })
          .populate({ path: "files", select: "_id originalname mimetype" })
          .sort({ updatedAt: -1 });

        res.status(200).json({ teamPosts, isAdmin });
      }
    });
  });
};

// Function to get assignments of a team
const getTeamAssignments = (req, res) => {
  let uid = req.headers.uid;
  let teamID = req.body.teamID;
  let isAdmin = false;

  User.findById(uid).then((user) => {
    Team.findById(
      teamID,
      "id admin members assignment",
      async function (err, docs) {
        if (err) {
          res.status(500).json({
            error: "Error getting teams!",
          });
          return;
        }
        if (docs?.admin.includes(user.id, 0)) {
          isAdmin = true;
        }
        let assignments = docs?.assignment;
        if (assignments == []) {
          res.status(200).json({
            assignments: [],
          });
        } else {
          let teamAssignments = await Assignment.find(
            {
              _id: {
                $in: assignments,
              },
            },
            "title dueDate _id"
          ).sort({ dueDate: 1 });

          res.status(200).json({
            teamAssignments,
            isAdmin,
          });
        }
      }
    );
  });
};

// Function to get members of a team
const getTeamMembers = async (req, res) => {
  let uid = req.headers.uid;
  let teamID = req.body.teamID;
  let isAdmin = false;

  Team.findById(teamID, "admin").then((team) => {
    if (team.admin.includes(uid)) {
      isAdmin = true;
    }
  });

  User.findById(uid).then(async (user) => {
    let teamMembers = await Team.findById(teamID, "admin members -_id")
      .populate({ path: "admin", select: "name email _id" })
      .populate({ path: "members", select: "name email _id" });
    if (teamMembers.admin.includes(user._id, 0)) {
      res.status(200).json({ teamMembers, isAdmin });
    } else {
      res.status(200).json({ teamMembers, isAdmin });
    }
  });
};

// Function to get files associated with a team
const getTeamFiles = async (req, res) => {
  let uid = req.headers.uid;
  let teamID = req.body.teamid;
  let files = await Team.find(
    { _id: teamID, $or: [{ admin: uid }, { members: { $in: uid } }] },
    "_id files"
  )
    .populate({ path: "files", select: "_id originalname mimetype" })
    .sort({ createdAt: 1 });

  res.status(200).json(files);
};

// Function to upload files to a team
const uploadFiles = (req, res) => {
  let teamID = req.body.teamID;
  let files = res.locals.files;
  Team.findByIdAndUpdate(teamID, { $push: { files: files } })
    .then((data) => {
      for (let index = 0; index < files.length; index++) {
        var dir = path.join(
          __dirname,
          `../files/${teamID}/files/${files[index].originalname}`
        );
        var des = path.join(__dirname, `../files/${teamID}/files/`);
        fs.move(files[index].path, dir, { overwrite: true });
        File.findByIdAndUpdate(files[index]._id, {
          $set: { path: dir, destination: des },
        }).then(() => {});
      }
      res.status(200).json({
        code: 200,
        message: "Post Created",
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error,
      });
    });
};

// Function to delete a file from a team's files
const deleteFile = (req, res) => {
  let teamID = req.headers.teamid;
  let fileID = req.headers.fileid;
  Team.findByIdAndUpdate(teamID, { files: { $pull: fileID } }).then((team) => {
    File.findById(fileID, "path").then((file) => {
      fs.unlink(file.path, (err) => {
        if (err) throw err;
      });
      File.findByIdAndDelete(fileID).then(() => {
        res.status(200).json({
          code: 200,
          message: "File deleted!",
        });
      });
    });
  });
};

module.exports = {
  getTeams,
  joinTeam,
  createTeams,
  getTeamDetails,
  getTeamPosts,
  getTeamAssignments,
  getTeamFiles,
  getTeamMembers,
  addmember,
  removeMember,
  uploadFiles,
  deleteFile,
};

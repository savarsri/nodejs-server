const User = require("../models/User");
const Team = require("../models/Team");
const Assignment = require("../models/Assignment");

const createAssignment = (req, res) => {
  let uid = req.body.uid;
  let code = req.body.code;
  let assignmentTitle = req.body.title;
  User.findById(uid).then((user) => {
    Team.findOne({ code }, "id admin members", function (err, docs) {
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
      let teamID = docs.id;
      let assignment = new Assignment({
        team: teamID,
        title: assignmentTitle,
        notSubmittedBy: docs.members,
      });

      assignment.save().then((assignment)=>{
        Team.findByIdAndUpdate(teamID,{ $push: { assignment: assignment} }).then(()=>{
            res.status(200);
        }).catch((error)=>{
            assignment.deleteOne();
            res.status(500).json(error);
        })
      }).catch((error)=>{
        res.status(500).json(error)
      })
    });
  });
};

module.exports = { createAssignment };

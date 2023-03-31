const User = require("../models/User");
const Team = require("../models/Team");
const Assignment = require("../models/Assignment");

const createAssignment = (req, res) => {
  let uid = req.body.uid;
  let code = req.body.code;
  let assignmentTitle = req.body.title;
  let assignmentDescription = req.body.description;
  let assignmentDueDate = req.body.dueDate;
  let assignmentGrade = req.body.grade;
  User.findById(uid).then((user) => {
    Team.findOne({ code }, "id admin", function (err, docs) {
      if (err) {
        res.status(500).json({
          error: "Error getting teams!",
        });
        return;
      }
      if (!user.teams.includes(docs.id, 0)) {
        return;
      }
      if (!docs.admin.includes(user.id, 0)) {
        return;
      }
      let teamID = docs.id;
      let assignment = new Assignment({
        team: teamID,
        title: assignmentTitle,
        description: assignmentDescription,
        dueDate: assignmentDueDate,
        notSubmittedBy: docs.members,
        grade: assignmentGrade,
      });

      assignment
        .save()
        .then((assignment) => {
          Team.findByIdAndUpdate(teamID, { $push: { assignment: assignment } })
            .then(() => {
              res.status(200);
            })
            .catch((error) => {
              assignment.deleteOne();
              res.status(500).json(error);
            });
        })
        .catch((error) => {
          res.status(500).json(error);
        });
    });
  });
};

const updateAssignment = (req, res) => {
  let uid = req.body.uid;
  let assignmentId = req.body.assignmentId;
  let assignmentTitle = req.body.title;
  let assignmentDescription = req.body.description;
  let assignmentDueDate = req.body.dueDate;
  let assignmentGrade = req.body.grade;
  User.findById(uid).then((user) => {
    Team.findOne({ code }, "id admin", function (err, docs) {
      if (err) {
        res.status(500).json({
          error: "Error getting teams!",
        });
        return;
      }
      if (!user.teams.includes(docs.id, 0)) {
        return;
      }
      if (!docs.admin.includes(user.id, 0)) {
        return;
      }
      
      Assignment.findByIdAndUpdate(assignmentId, {
        title: assignmentTitle,
        description: assignmentDescription,
        dueDate: assignmentDueDate,
        grade: assignmentGrade,
      }).then((docs) => {}).catch((error)=>{
        res.status(500).json({
          error: "Error: cannot update assignment"
        })
      });
    });
  });
};

const deleteAssignment = (req, res) => {
  let uid = req.body.uid;
  let assignmentId = req.body.assignmentId;
  User.findById(uid).then((user) => {
    Team.findOne({ code }, "id admin", function (err, docs) {
      if (err) {
        res.status(500).json({
          error: "Error getting teams!",
        });
        return;
      }
      if (!user.teams.includes(docs.id, 0)) {
        return;
      }
      if (!docs.admin.includes(user.id, 0)) {
        return;
      }
      let teamID = docs.id;
      Assignment.findByIdAndDelete(assignmentId)
        .then(() => {
          Team.findByIdAndUpdate(teamID, {
            $pull: { assignment: assignmentId },
          })
            .then(() => {
              res.status(200);
            })
            .catch((error) => {
              assignment.deleteOne();
              res.status(500).json(error);
            });
        })
        .catch(() => {
          res.status(500);
        });
    });
  });
};

const submitAssignment = (req,res)=>{

}

module.exports = { createAssignment, updateAssignment, deleteAssignment, submitAssignment };

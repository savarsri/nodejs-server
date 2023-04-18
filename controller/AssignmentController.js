const User = require("../models/User");
const Team = require("../models/Team");
const Assignment = require("../models/Assignment");

const getAssignment = (req, res) => {
  let uid = req.headers.uid;
  let assignmentID = req.body.assignmentID;
  User.findById(uid).then((user) => {
    Assignment.findById(assignmentID).populate({path: "submittedBy", select: "name email avatar _id"}).populate({path:"notSubmittedBy",select: "name email avatar _id"}).then((assignment)=>{
      if(assignment.createdBy==uid){
        res.status(200).json({
          assignment,
          isAdmin:true,
        });
      }else if(assignment.submittedBy.includes(uid)){
        res.status(200).json({
          assignment:{
            title : assignment.title,
            description : assignment.description,
            dueDate : assignment.dueDate,
            grade:assignment.grade,
            submitted: true,
          },
          isAdmin: false,
        });
      }else{
        res.status(200).json({
          assignment: {
            title : assignment.title,
            description : assignment.description,
            dueDate : assignment.dueDate,
            grade:assignment.grade,
            submitted: false,
          },
          isAdmin: false,
        });
      }
    }).catch((error)=>{
      res.status(404).json({
        error: "Assignment not found"
      })
    })
  });
};

const createAssignment = (req, res) => {
  let uid = req.headers.uid;
  let createdBy = req.body.uid;
  let teamID = req.body.teamID;
  let assignmentTitle = req.body.title;
  let assignmentDescription = req.body.description;
  let assignmentDueDate = req.body.dueDate;
  let assignmentGrade = req.body.grade;
  
  User.findById(uid).then((user) => {
    Team.findById(teamID, "id admin members", function (err, docs) {
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
        createdBy: createdBy,
        title: assignmentTitle,
        description: assignmentDescription,
        dueDate: assignmentDueDate,
        notSubmittedBy: docs.members,
        grade: assignmentGrade,
        // file: url + `./files/${teamID}/assignments` + req.file.filename
      });

      assignment
        .save()
        .then((assignment) => {
          Team.findByIdAndUpdate(teamID, { $push: { assignment: assignment } })
            .then(() => {
              res.status(200).json({
                message: "Assignment Created"
              });
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
  let uid = req.headers.uid;
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
      })
        .then((docs) => {})
        .catch((error) => {
          res.status(500).json({
            error: "Error: cannot update assignment",
          });
        });
    });
  });
};

const deleteAssignment = (req, res) => {
  let uid = req.headers.uid;
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
              res.status(500).json(error);
            });
        })
        .catch(() => {
          res.status(500);
        });
    });
  });
};

const submitAssignment = (req, res) => {
  Assignment.findByIdAndUpdate(req.body.assignmentID, {
    $push: { submittedBy: req.headers.uid },
  });
};

const unSubmitAssignment = (req, res) => {
  Assignment.findByIdAndUpdate(req.body.assignmentID, {
    $pull: { submittedBy: req.headers.uid },
  });
};

const gradeAssignment = (req, res) => {};

module.exports = {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  unSubmitAssignment,
  gradeAssignment,
  getAssignment
};

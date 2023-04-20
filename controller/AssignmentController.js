const User = require("../models/User");
const Team = require("../models/Team");
const Assignment = require("../models/Assignment");
const File = require("../models/File");
const fs = require("fs-extra");
// var fs = require('fs');
const path = require("path");

const getAssignment = (req, res) => {
  let uid = req.headers.uid;
  let assignmentID = req.body.assignmentID;
  User.findById(uid).then((user) => {
    Assignment.findById(assignmentID)
      .populate({ path: "submittedBy", select: "name email avatar _id" })
      .populate({ path: "notSubmittedBy", select: "name email avatar _id" })
      .populate({ path: "files", select: "_id originalname mimetype" })
      .sort({ updatedAt: -1 })
      .then((assignment) => {
        if (assignment.createdBy == uid) {
          res.status(200).json({
            assignment,
            isAdmin: true,
          });
        } else if (assignment.submittedBy.includes(uid)) {
          res.status(200).json({
            assignment: {
              _id: assignment._id,
              title: assignment.title,
              description: assignment.description,
              dueDate: assignment.dueDate,
              grade: assignment.grade,
              files: assignment.files,
              submitted: true,
            },
            isAdmin: false,
          });
        } else {
          res.status(200).json({
            assignment: {
              _id: assignment._id,
              title: assignment.title,
              description: assignment.description,
              dueDate: assignment.dueDate,
              grade: assignment.grade,
              files: assignment.files,
              submitted: false,
            },
            isAdmin: false,
          });
        }
      })
      .catch((error) => {
        res.status(404).json({
          error: "Assignment not found",
        });
      });
  });
};

const createAssignment = (req, res, next) => {
  let uid = req.headers.uid;
  let createdBy = req.headers.uid;
  let teamID = req.body.teamID;
  let assignmentTitle = req.body.title;
  let assignmentDescription = req.body.description;
  let assignmentDueDate = req.body.dueDate;
  let assignmentGrade = req.body.grade;
  let assignmentFiles = res.locals.files;

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
        files: assignmentFiles,
      });

      assignment
        .save()
        .then((assignment) => {
          Team.findByIdAndUpdate(teamID, { $push: { assignment: assignment } })
            .then(() => {
              var srcDel = path.join(
                __dirname,
                `../temp/uploads/${req.headers.uploadid}`
              );

              for (let index = 0; index < assignmentFiles.length; index++) {
                var dir = path.join(
                  __dirname,
                  `../files/${teamID}/assignments/${assignment._id}/materials/${assignmentFiles[index].originalname}`
                );
                var des = path.join(
                  __dirname,
                  `../files/${teamID}/assignments/${assignment._id}/materials/`
                );
                fs.move(assignmentFiles[index].path, dir, { overwrite: true });
                File.findByIdAndUpdate(assignmentFiles[index]._id, {
                  $set: { path: dir, destination: des },
                }).then(() => {});
              }
              // fs.rmSync(srcDel, { recursive: true, force: true });
              res.status(200).json({
                code: 200,
                message: "Assignment created",
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
  let files = res.locals.files;
  Assignment.findByIdAndUpdate(req.body.assignmentID, {
    $push: { submittedBy: req.headers.uid },
    $pull: { notSubmittedBy: req.headers.uid },
  }).then((assignment) => {
    var srcDel = path.join(
      __dirname,
      `../temp/uploads/${req.headers.uploadid}`
    );

    for (let index = 0; index < files.length; index++) {
      var dir = path.join(
        __dirname,
        `../files/${assignment.team}/assignments/${assignment._id}/uploads/${req.headers.uid}/${files[index].originalname}`
      );

      var des = path.join(
        __dirname,
        `../files/${assignment.team}/assignments/${assignment._id}/uploads/${req.headers.uid}`
      );
      fs.move(files[index].path, dir, { overwrite: true });
      File.findByIdAndUpdate(files[index]._id, {
        $set: { path: dir, destination: des },
      }).then(() => {});
    }
    res.status(200).json({
      code: 200,
      message: "Assignment submitted",
    });
    // fs.rmSync(srcDel, { recursive: true, force: true });
  });
};

const unSubmitAssignment = (req, res) => {
  Assignment.findByIdAndUpdate(req.headers.assid, {
    $pull: { submittedBy: req.headers.uid },
    $push: { notSubmittedBy: req.headers.uid },
  }).then((assignment)=>{
    var des = path.join(
      __dirname,
      `../files/${assignment.team}/assignments/${assignment._id}/uploads/${req.headers.uid}`
    );
    File.deleteMany({destination: des}).then(()=>{
      fs.rmSync(des, { recursive: true, force: true });
      res.status(200).json({
        code: 200,
        message: "Assignment unsubmitted",
      });
    })
  });
};

const gradeAssignment = (req, res) => {};

const testUpload = (req, res, next) => {
  console.log(req.body);
  console.log("hello");
  next();
  // console.log(req.headers);
};

module.exports = {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  unSubmitAssignment,
  gradeAssignment,
  getAssignment,
  testUpload,
};

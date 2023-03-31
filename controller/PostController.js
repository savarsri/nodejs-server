const User = require("../models/User");
const Team = require("../models/Team");
const Post = require("../models/Post");

const createPost = (req,res)=>{
    let uid = req.body.uid;
    let teamID = req.body.teamID;
    let content = req.body.content;
    let attachments = req.body.attachments;

    let post = new Post({
        content: content,
        createdBy: uid,
        team: teamID,
        attachments: attachments
      });
    
      post.save().then((post)=>{
        Team.findByIdAndUpdate(teamID, { $push: { posts: post } }).then((data)=>{
          res.status(200).json({
            message: "Post Created"
          });
        }).catch((error)=>{
          res.status(500).json({
            error
          })
        });
      }).catch((error)=>{
        res.json({
            error
        });
      })
    
}

const updatePost = (req,res)=>{
  Post.findByIdAndUpdate(req.body.postID,{content: req.body.content, attachments: req.body.attachments,}).then((post)=>{
    res.status(200).json({
      message: "Post updated"
    })
  }).catch((error)=>{
    res.status(500).json({
      error
    })
  })
}

const deletePost = (req,res)=>{
    Post.findOne({ 
        _id: req.body.postID,
        createdBy: req.body.uid,
      })
      .remove()
      .exec().then(()=>{
        res.status(200).json({
          message: "Deleted Post"
        })
      }).catch((error)=>{
        res.status(500).json({
          error
        })
      });
}


module.exports = {createPost, updatePost, deletePost}
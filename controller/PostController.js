const User = require("../models/User");
const Team = require("../models/Team");
const Channel = require("../models/Team");
const Post = require("../models/Team");

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

      }).catch((error)=>{
        res.json({
            error
        });
      })
    
}

const updatePost = (req,res)=>{

}

const deletePost = (req,res)=>{
    Post.findOne({ 
        _id: req.body.postID,
        createdBy: req.body.uid,
      })
      .remove()
      .exec();
}


module.exports = {createPost, updatePost, deletePost}
const User = require("../models/User");
const Team = require("../models/Team");
const Post = require("../models/Post");

const createPost = (req,res)=>{
    let uid = req.headers.uid;
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
            code:200,
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

const deletePost = async (req,res)=>{
  let uid = req.headers.uid;
  let postID = req.body.postID;
  await Post.findById(postID, 'team').then((post)=>{
    Team.findById(post.team ,'admin').then((team)=>{
      if(team.admin.includes(uid,0)){
        Post.findOne({ 
          _id: postID,
        })
        .remove()
        .exec().then(()=>{
          res.status(200).json({
            code: 200,
            message: "Deleted Post"
          })
          return;
        }).catch((error)=>{
          res.status(500).json({
            error
          })
          return;
        });
      }else{
        Post.findOne({ 
          _id: postID,
          createdBy: uid,
        })
        .remove()
        .exec().then(()=>{
          res.status(200).json({
            code: 200,
            message: "Deleted Post"
          })
          return;
        }).catch((error)=>{
          res.status(500).json({
            error
          })
          return;
        });
      }
    }).catch((error)=>{
      res.status(500).json(error);
      return;
    })
  }).catch((error)=>{
    res.status(500).json(error);
    return;
  });
    
}


module.exports = {createPost, updatePost, deletePost}
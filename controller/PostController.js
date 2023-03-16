const User = require("../models/User");
const Team = require("../models/Team");
const Channel = require("../models/Team");

const createPost = (req,res)=>{
    let uid = req.body.uid;
    let teamID = req.body.teamID;
    let channelID = req.body.channelID;
    let content = req.body.content;
    let attachments = req.body.attachments;

    Channel.findById(uid).then((docs)=>{
        res.json({
            docs
        })
    })
    
}

const updatePost = (req,res)=>{

}

const deletePost = (req,res)=>{

}


module.exports = {createPost, updatePost, deletePost}
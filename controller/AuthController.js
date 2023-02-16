const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = (req, res) => {
    User.findOne({$or: [{email:email}, {phone:email}]})
    .then(user=>{
        if(user){
            res.status(200).json({
                code: 404,
                message: 'User already exists'
            });
        }else{
            bcrypt.hash(req.body.password, 10, function(err, hashedPass){
                if(err){
                    res.json({
                        error: err
                    })
                }
                let user = new User({
                    name:req.body.name,
                    email:req.body.email,
                    age:req.body.age,
                    password: hashedPass
                })
                user.save()
                .then(user => {
                    res.status(200).json({
                        code: 200,
                        user,
                        message: "user added successfully"
                    })
                })
                .catch(error => {
                    res.status(500).json({
                        code: 500,
                        error,
                        message: 'error occured'
                    })
                })
            })
        }
    })
}

const login = (req, res) => {
    var email = req.body.email
    var password = req.body.password

    User.findOne({$or: [{email:email}, {phone:email}]})
    .then(user => {
        if(user){
                    bcrypt.compare(password, user.password, function(error, result){
                        if(error){
                            res.json({
                                error
                            })
                        }
                        if(result){
                            let token = jwt.sign({name:user.name}, 'AzQPI!', {expiresIn: '1h'})
                            res.status(200).json({
                                code:200,
                                message: 'login successful',
                                token});
                        }else{
                            res.status(200).json({
                                code: 401,
                                message: 'password does not match'
                            })
                        }
                    })
        }else{
            res.status(200).json({
                code: 404,
                message: 'no user found'
            });
        }
    })
    .catch(error=>{
        res.status(500).json({
            code: 500,
            error,
            message: "Try again"
        });
        
    })
}

module.exports = {
    register, login
}
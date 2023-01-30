const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = (req, res, next) => {
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
            res.json({
                message: "user added successfully"
            })
        })
        .catch(error => {
            res.json({
                message: 'error occured'
            })
        })
    })

   
}

const login = (req, res, next) => {
    var username = req.body.username
    var password = req.body.password

    User.findOneAndDelete({$or: [{email:username}, {phone:username}]})
    .then(user => {
    if(user){
                bcrypt.compare(password, user.password, function(err, result){
                    if(err){
                        res.json({
                            error: err
                        })
                    }
                    if(result){
                        let token = jwt.sign({name:user.name}, 'AzQPI!', {expiresIn: '1h'})
                        res.json({
                            message: ' login successful',
                            token
                        })
                    }else{
                        res.json({
                            message: 'password does not match'
                        })
                    }
                })
    }else{
        res.json({
            message: 'no user found'
        })
    }
    })
}

module.exports = {
    register, login
}
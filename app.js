const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
// const { MongoUnexpectedServerResponseError } = require("mongodb");
let PORT = process.env.PORT || 8080;
app.engine('html', require('ejs').renderFile);
dotenv.config();
const saltRounds=10;
const users=[]
app.use(express.urlencoded({extended: false}))

app.post("/register.html", async(req,res)=>{

    try{
        // const hashedpassword= bcrypt.hash(req.body.password, (err,users))
        bcrypt.hash(req.body.password, saltRounds, function(err, newpassword) {
            // Store hash in database here
            users.push({ 
                id: Date.now().toString(),
                email: req.body.email,
                password: newpassword,
            })
            console.log(users); 
            res.redirect("/adminlogin")
        });
    } catch(e){
        console.log(e);
        res.redirect('/register.html')
    }

})

app.post("/user/generateToken", (req, res) => {
    // Validate User Here
    // Then generate JWT Token
  
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
        time: Date(),
        userId: 12,
    }
  
    const token = jwt.sign(data, jwtSecretKey);
  
    res.send(token);
});
  
// Verification of JWT
app.get("/user/validateToken", (req, res) => {
    // Tokens are generally passed in header of request
    // Due to security reasons.
  
    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
  
    try {
        const token = req.header(tokenHeaderKey);
  
        const verified = jwt.verify(token, jwtSecretKey);
        if(verified){
            return res.send("Successfully Verified");
        }else{
            // Access Denied
            return res.status(401).send(error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
});

app.get("/adminlogin", function (req, res) {
    res.render(__dirname + '/index.html')

});


app.get("/register.html", function(req, res){
    res.render(__dirname + '/register.html')
})


// app.post('/register', function(req,res){
//     res.render('register.html')
// })
app.listen(PORT, function () {
    console.log("Server is running on localhost:8080");
});

// Connect to DB

mongoose.connect("mongodb://192.168.1.158/27017", {useNewUrlParser: true, useUnifiedTpoplogy: true}, () => {
    console.log("Connection successfull!");
})
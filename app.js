const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
// const { MongoUnexpectedServerResponseError } = require("mongodb");

app.engine('html', require('ejs').renderFile);
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
                password:   ,
            })
            console.log(users); 
            res.redirect("/adminlogin")
        });
    } catch(e){
        console.log(e);
        res.redirect('/register.html')
    }

})

app.get("/adminlogin", function (req, res) {
    res.render(__dirname + '/index.html')

});


app.get("/register.html", function(req, res){
    res.render(__dirname + '/register.html')
})


// app.post('/register', function(req,res){
//     res.render('register.html')
// })
app.listen(8080, function () {
    console.log("Server is running on localhost:8080");
});
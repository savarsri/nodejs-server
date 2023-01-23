const express = require("express");
const app = express();

app.engine('html', require('ejs').renderFile);

app.get("/", function (req, res) {
    res.render(__dirname + '/index.html')

});

app.get("/register.html", function(req, res){
    res.render(__dirname + '/register.html')
})

// app.post('/register', function(req,res){
//     res.render('register.html')
// })
app.listen(8080, function () {
    console.log("Server is running on localhost3000");
});
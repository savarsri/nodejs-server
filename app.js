const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const path = require('path');
const bodyParser = require('body-parser')
const AuthRoute = require('./routes/authRoute')
const TeamsRoute = require('./routes/teamRoute')
const AssignmentRoute = require('./routes/assignmentRoute');
const EmployeeRoute = require('./routes/employee')
const importExcelData2MongoDB = require('./middleware/excelupload')


var storage = multer.diskStorage({  
    destination:(req,file,cb)=>{  
    cb(null,'./public/uploads');  
    },  
    filename:(req,file,cb)=>{  
    cb(null,file.originalname);  
    }  
    });  
    var uploads = multer({storage:storage});  

// Connection with mongoDB database

mongoose.set("strictQuery", false);
mongoose.connect('mongodb://192.168.1.158:27017/testdb', {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection

// mongoDB database connection error handing

db.on('error', (err) => {
    console.log(err)
})

db.once('open', () => {
    console.log('database connection done')
})

const app = express()

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use('/uploads', express.static('uploads'))
const PORT = process.env.PORT || 3000

// Server listening port 

app.listen(PORT, ()=>{
    console.log('server is running on port 3000')
})

// Admin panel 

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './admin-panel/login.html'));
});

app.post('/uploadfile', upload.single("uploadfile"), (req, res) =>{
    importExcelData2MongoDB(__dirname + '/uploads/' + req.file.filename);
    console.log(res);
    }); 
//Api routes set-up

app.use('/api/teams', TeamsRoute)
app.use('/api/auth', AuthRoute)
app.use('/api/employee', EmployeeRoute)
app.use('/api/assignment', AssignmentRoute)
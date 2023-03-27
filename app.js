const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const multer = require('multer');
const excelToJson = require("convert-excel-to-json");
const bodyParser = require("body-parser");
const authenticate = require('./middleware/authenticate');
const AuthRoute = require("./routes/authRoute");
const TeamsRoute = require("./routes/teamRoute");
const AssignmentRoute = require("./routes/assignmentRoute");
const PostRoute = require("./routes/postRoute");
const EmployeeRoute = require("./routes/employee");
const User = require("./models/User");
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss');
const mongoSanitize = require('mongo-sanitize');
// const io = require('socket.io')(http)
// import {importExcelData2MongoDB} from "./middleware/excelupload"

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

// Connection with mongoDB database

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://192.168.1.158:27017/testdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// mongoDB database connection error handing

db.on("error", (err) => {
  console.log(err);
});

db.once("open", () => {
  console.log("database connection done");
});

const app = express();
const http = require('http').createServer(app)

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
// app.use(cors);
// app.use(helmet);
// app.use(xss);
// app.use(mongoSanitize);
app.use("/uploads", express.static("uploads"));
const PORT = process.env.PORT || 3000;

// Server listening port

app.listen(PORT, () => {
  console.log("server is running on port 3000");
});

// Admin panel

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "./admin-panel/login.html"));
});

app.post("/uploadfile", upload.single("uploadfile"), (req, res) => {
  importExcelData2MongoDB(__dirname + "/public/uploads/" + req.file.filename);
  console.log(res);
});
//Api routes set-up

app.use("/api/teams",authenticate, TeamsRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/employee", EmployeeRoute);
app.use("/api/assignment", AssignmentRoute);
app.use("/api/post", PostRoute);


// Socket 


// io.on('connection', (socket) => {
//     console.log('Connected...')
//     socket.on('message', (msg) => {
//         socket.broadcast.emit('message', msg)
//     })

// })
// app.use(express.static(__dirname + "/chat"))
// app.get('/chat', (req, res) => {
//   res.sendFile(__dirname +  "/chat/chat.html")
// })

const importExcelData2MongoDB = (filePath) => {
    // -> Read Excel File to Json Data
    const excelData = excelToJson({
      sourceFile: filePath,
      sheets: [
        {
          // Excel Sheet Name
          name: "User",
          // Header Row -> be skipped and will not be present at our result object.
          header: {
            rows: 1,
          },
          // Mapping columns to keys
          columnToKey: {
            A: "name",
            B: "email",
            C: "password",
          },
        },
      ],
    });

    const data = Object.values(excelData);
    
    // Insert Json-Object to MongoDB
    User.insertMany(data[0], (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
    fs.unlinkSync(filePath);
  }

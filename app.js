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
const ChatRoute = require("./routes/chatRoute");
const MessageRoute = require("./routes/messageRoute");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const socket = require('socket.io');
const http = require('http');

// const cors = require('cors');
// const helmet = require('helmet');
// const xss = require('xss');
// const mongoSanitize = require('mongo-sanitize');
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
mongoose.connect("mongodb://127.0.0.1:27017/testdb", {
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
const server = http.createServer(app);

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

app.use("/api/teams", TeamsRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/employee", EmployeeRoute);
app.use("/api/assignment", AssignmentRoute);
app.use("/api/post", PostRoute);
app.use("/api/chat", ChatRoute);
app.use("/api/message", MessageRoute);


// Socket 

const io = new socket.Server(server, {
  pingTimeout: 60000,
  // cors: {
  //   origin: "*",
  // },
});

io.on("connection", (socket) => {
  //connected to correct id
  socket.on("setup", (userData) => {
    socket.join(userData._id);

    socket.emit("connected");
  });

  socket.on("join-chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop-typing", (room) => socket.in(room).emit("stop-typing"));

  socket.on("new-message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;

    if (!chat.users) return console.log(`chat.users not defined`);

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message-received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    socket.leave(userData._id);
  });
});

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

async function importExcelData2MongoDB(filePath){
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

    const temp = Object.values(excelData);
    var data = temp[0];
    delete(temp);

    // data = await createHashedPass(data);
    console.log(data)
    // Insert Json-Object to MongoDB

    await addUsers(data);
    
    // fs.unlinkSync(filePath);
  }

async function createHashedPass(data){
  for (let index = 0; index < data.length; index++) {
    const pass = bcrypt.hash(data[index].password, 10, function (err, hashedPass) {
      if (err) {
        res.json({
          error: err,
        });
      }else{
        return hashedPass;
      }
    });
    data[index].password = pass;
  }
  return data;
}

async function addUsers(data){
  User.insertMany(data, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log('hello');
      // res.redirect("/");
    }
  });
}


// module.exports = {upload, mkdirectory}
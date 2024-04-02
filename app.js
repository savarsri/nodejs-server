const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const multer = require("multer");
const excelToJson = require("convert-excel-to-json");
const bodyParser = require("body-parser");
const authenticate = require("./middleware/authenticate");
const AuthRoute = require("./routes/authRoute");
const TeamsRoute = require("./routes/teamRoute");
const AssignmentRoute = require("./routes/assignmentRoute");
const PostRoute = require("./routes/postRoute");
const EmployeeRoute = require("./routes/employee");
const ChatRoute = require("./routes/chatRoute");
const MessageRoute = require("./routes/messageRoute");
const User = require("./models/User");
const File = require("./models/File");
const bcrypt = require("bcryptjs");
const socket = require("socket.io");
const http = require("http");
const AssignmentController = require("./controller/AssignmentController");
const PostController = require("./controller/PostController");
const TeamsController = require("./controller/TeamsController");
var fs = require("fs");

// Define storage settings for file uploads using multer
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const directory = path.join(
      __dirname,
      `/temp/uploads/${req.headers.uploadid}`
    );

    // Ensure the destination directory exists, creating it if needed
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    cb(null, directory);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

// Connection with MongoDB database
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://sakshamgupta912:oSMxD60kID1g6Gwz@collabsphere.frcm25p.mongodb.net/testDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Handle MongoDB database connection errors
db.on("error", (err) => {
  console.log(err);
});

db.once("open", () => {
  console.log("database connection done");
});

const app = express();
const server = http.createServer(app);

const cors = require("cors");
const { log } = require("console");
const corsOptions = {
  origin: "http://localhost:3001",
  credentials: true, // Access control for credentials
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Enable CORS with specified options

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads")); // Serve uploaded files

const PORT = process.env.PORT || 3000;

// Server listening on the specified port
app.listen(PORT, () => {
  console.log("server is running on port 3000");
});

// Admin panel
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "./admin-panel/login.html"));
});

// Define routes for various API endpoints and apply authentication middleware
app.use("/api/teams", authenticate, TeamsRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/assignment", authenticate, AssignmentRoute);
app.use("/api/post", authenticate, PostRoute);
app.use("/api/chat", authenticate, ChatRoute);
app.use("/api/message", authenticate, MessageRoute);

// Endpoint for downloading a file
app.get("/api/download", authenticate, function (req, res) {
  console.log(req.headers);
  File.findById(req.headers.fileid).then((file) => {
    res.download(
      file.path,
      file.originalname,
      (err) => {
        if (err) {
          res.send({
            error: err,
            msg: "Problem downloading the file",
          });
        }
      }
    );
  });
});

// Endpoint for creating assignments with file uploads
app.post(
  "/api/assignment/createAssignment",
  authenticate,
  upload.array("files"),
  (req, res, next) => {
    File.insertMany(req.files, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.locals.files = data;
        next();
      }
    });
  },
  AssignmentController.createAssignment
);

// Endpoint for creating posts with file uploads
app.post(
  "/api/post/createPost",
  authenticate,
  upload.array("files"),
  (req, res, next) => {
    File.insertMany(req.files, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.locals.files = data;
        next();
      }
    });
  },
  PostController.createPost
);

// Endpoint for submitting assignments with file uploads
app.post(
  "/api/assignment/submitAssignment",
  authenticate,
  upload.array("files"),
  (req, res, next) => {
    File.insertMany(req.files, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.locals.files = data;
        next();
      }
    });
  },
  AssignmentController.submitAssignment
);

// Endpoint for uploading files in teams
app.post(
  "/api/teams/teamUploadFiles",
  authenticate,
  upload.array("files"),
  (req, res, next) => {
    File.insertMany(req.files, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.locals.files = data;
        next();
      }
    });
  },
  TeamsController.uploadFiles
);

// Socket configuration
const io = new socket.Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.listen(9000, () => {
  console.log("io listening on 9000");
});

io.on("connection", (socket) => {
  // Connected to the correct user's room
  socket.on("setup", (userData) => {
    socket.join(userData._id);

    socket.emit("connected");
  });

  socket.on("join-chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing")
  });
  socket.on("stop-typing", (room) => socket.in(room).emit("stop-typing"));

  socket.on("new-message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;

    if (!chat.users) return console.log(`chat.users not defined`);

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message-received", newMessageReceived);
    });
  });

  // Cleanup when the socket disconnects
  socket.off("setup", () => {
    socket.leave(userData._id);
  });
});

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const taskRouter = require("./routes/taskRouter.js");
const authRouter = require("./routes/authRouter.js");
const cookieParser = require("cookie-parser");
const { requireAuth } = require("./middleware/authMiddleware.js");

//Middleare
//Use morgan logger
app.use(morgan("combined"));
//JSON parser middleware
app.use(express.json());
//Set ejs template view engine
app.set("view engine", "ejs");
//Serving static files
app.use(express.static("public"));
//Cookie Parser middlewear
app.use(cookieParser());

//home page request, page is protected and needs authentication
app.get("/", requireAuth, (req, res) => {
  res.render("home");
});

//landingPage request
app.get("/landing", (req, res) => {
  res.render("landing");
});

//Send requests to authRouter
app.use(
  "/",
  async (req, res, next) => {
    console.log(req.url);
    next();
  },
  authRouter
);

//Send requests to taskRouter
//This should be after authentication router as the taskRouter can only be executed by logged in users only
app.use("/tasks", requireAuth, taskRouter);

//app.get("/", async (req, res) => {
//res.render("home");
//});

//Database connection open
mongoose
  .connect(
    "mongodb+srv://admin:admin@nodeapi.ga1iiw6.mongodb.net/taskmanager?retryWrites=true&w=majority&appName=nodeapi"
  )
  .then((response) => {
    console.log("Connected to database");
    //Start server
    app.listen(3000);
  });

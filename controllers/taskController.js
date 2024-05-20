const express = require("express");
const app = express();
const mongoose = require("mongoose");
const UserModel = require("../models/usermodel.js");
const jwt = require("jsonwebtoken");
const taskRouter = require("../routes/taskRouter.js");

//getTasks and Home Page for a specific user (userId)
const getTasks = async (req, res) => {
  //get userId and task from req
  const userId = res.locals.userId;
  //find user by Id from Users collection in mongodb
  const userAndTasks = await UserModel.findById(userId);
  //if user found return the tasks
  const tasks = userAndTasks.task;
  const name = userAndTasks.name;
  const surname = userAndTasks.surname;

  //tasks Not Started
  let notStarted = tasks.filter(
    (task) => task.status === "Not Started" || task.status === ""
  );
  //tasks In progress
  let inProgress = tasks.filter((task) => task.status === "In Progress");
  //tasks Completed
  let completed = tasks.filter((task) => task.status === "Completed");

  //render home page with tasks
  return res.render("home", {
    notStarted,
    inProgress,
    completed,
    name,
    surname,
  });
};

//postTask function - used to create a new task for a specific user (userId)
const postTask = async (req, res) => {
  //get userId from res.locals.userId retrieved for authentication middleware
  const userId = res.locals.userId;
  //task details is the req.body from create task form in the front end website
  const task = req.body;
  //find user by Id then add task
  const userAndTask = await UserModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        task: task,
      },
    },
    { new: true }
  );
  return res.redirect("/");
};

//updateTask function - used to update an existing task for a specific user (userId)
const updateTask = async (req, res) => {
  try {
    //get userId from res.locals.userId retrieved for authentication middleware
    const userId = res.locals.userId;
    //task details is the req.body from create task form in the front end website
    //const { title, description, status, dueDate } = req.body;
    const task = req.body;

    // Find the user by userId and update the specific task within the task array
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId, "task._id": task.taskId }, // Find user by userId and task by taskId
      {
        $set: {
          "task.$.title": task.title, // Update fields of the matched task
          "task.$.description": task.description,
          "task.$.status": task.status,
          "task.$.dueDate": task.dueDate,
        },
      },
      { new: true } // Return the updated document
    );

    return res.redirect("/");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//deleteTask function - delete task for a specific user
const deleteTask = async (req, res) => {
  //get userId from res.locals.userId retrieved for authentication middleware
  const userId = res.locals.userId;
  //task details is the req.body from create task form in the front end website
  const taskId = req.params.id;

  //find user by Id then pull task to be deleted from task array by Id
  const userAndTask = await UserModel.findByIdAndUpdate(
    userId,
    {
      $pull: { task: { _id: taskId } },
    },
    { new: true }
  );

  return res.redirect("/");
};

//update task status
const updateTaskStatus = async (req, res) => {
  try {
    //get userId from res.locals.userId retrieved for authentication middleware
    const userId = res.locals.userId;
    //task status and taskId is the req.body from update task status request
    const status = req.body.status;
    const taskId = req.body.taskId;

    console.log(userId);
    console.log(req.body);

    // Find the user by userId and update the specific task within the task array
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId, "task._id": taskId }, // Find user by userId and task by taskId
      {
        $set: {
          "task.$.status": status,
        },
      },
      { new: true } // Return the updated document
    );
    return res.redirect("/");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//update task title
const updateTaskTitle = async (req, res) => {
  try {
    //get userId from res.locals.userId retrieved for authentication middleware
    const userId = res.locals.userId;
    //task status and taskId is the req.body from update task status request
    const title = req.body.title;
    const taskId = req.body.taskId;

    console.log(userId);
    console.log(req.body);

    // Find the user by userId and update the specific task within the task array
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId, "task._id": taskId }, // Find user by userId and task by taskId
      {
        $set: {
          "task.$.title": title,
        },
      },
      { new: true } // Return the updated document
    );
    res.redirect("/");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  postTask,
  updateTask,
  deleteTask,
  updateTask,
  updateTaskStatus,
  updateTaskTitle,
};

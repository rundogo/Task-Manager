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
  //render home page with tasks
  return res.render("home", { tasks, name, surname });
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

    // Check if user was found and task was updated successfully
    if (updatedUser) {
      return res
        .status(200)
        .json({ user: updatedUser._id, tasks: updatedUser.task });
    } else {
      //if user not found
      return res.status(404).json({ message: "User or task not found" });
    }
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

//getTask by ID to edit it
const getTaskById = async (req, res) => {
  const userId = res.locals.userId;
  const taskId = req.params.id;

  try {
    const UserAndTask = await UserModel.findOne({
      _id: userId,
    });
    let updateTask;
    UserAndTask.task.forEach((task) => {
      if ((task._id = taskId)) {
        updateTask = task;
      }
    });
    res.json(updateTask);
  } catch (error) {
    res.json({ error: error.message });
  }
};

module.exports = { getTasks, postTask, updateTask, deleteTask, getTaskById };

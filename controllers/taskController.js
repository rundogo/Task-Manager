const express = require("express");
const app = express();
const mongoose = require("mongoose");
const UserModel = require("../models/usermodel.js");
const jwt = require("jsonwebtoken");
const taskRouter = require("../routes/taskRouter.js");

//getTasks for a specific user (userId)
const getTasks = async (req, res) => {
  try {
    //get userId and task from req
    const userId = res.locals.userId;
    //find user by Id from Users collection in mongodb
    const userAndTasks = await UserModel.findById(userId);
    if (userAndTasks) {
      //if user found return the tasks as response
      return res.status(200).json(userAndTasks.task);
    }
    //If user not found return User not found message
    return res.json({ error: "User not found" });
  } catch (error) {
    // Handle any unexpected errors
    return res.json({ message: error.message });
  }
};

//postTask function - used to create a new task for a specific user (userId)
const postTask = async (req, res) => {
  try {
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
    if (userAndTask) {
      //Send success response and user tasks
      return res.status(200).json(userAndTask.task);
    }
    //Send user not found response if user not identified
    return res.json({ error: "User not found" });
  } catch (error) {
    // Handle any unexpected errors
    return res.json({ message: error.message });
  }
};

//updateTask function - used to update an existing task for a specific user (userId)
const updateTask = async (req, res) => {
  try {
    //get userId from res.locals.userId retrieved for authentication middleware
    const userId = res.locals.userId;
    //task details is the req.body from create task form in the front end website
    //const { title, description, status, dueDate } = req.body;
    const task = req.body;
    console.log(userId);
    console.log(task);

    // Find the user by userId and update the specific task within the task array
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId, "task._id": task._id }, // Find user by userId and task by taskId
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
  const taskId = req.body._id;
  try {
    //find user by Id then pull task to be deleted from task array by Id
    const userAndTask = await UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: { task: { _id: taskId } },
      },
      { new: true }
    );
    if (userAndTask) {
      //if user exists
      return res.json({ user: userAndTask._id, tasks: userAndTask.task });
    }
    //if user not exist
    return res.json({ error: "User not found" });
  } catch (error) {
    return res.json({ error: error.message });
  }
};

module.exports = { getTasks, postTask, updateTask, deleteTask };

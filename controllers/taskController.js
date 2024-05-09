const express = require("express");
const app = express();
const mongoose = require("mongoose");
const TaskModel = require("../models/taskmodel.js");
const UserModel = require("../models/usermodel.js");
const jwt = require("jsonwebtoken");

//getTasks for a specific user (userId)
const getTasks = async (req, res) => {
  try {
    //get userId and task from req
    const userId = res.locals.userId;
    //find user by Id from Users collection in mongodb
    const userAndTasks = await UserModel.findById(userId);
    if (userAndTasks) {
      //if user found return the tasks as response
      return res.status(200).json({ userAndTasks });
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
    //get userId and task from req
    const userId = res.locals.userId;
    console.log(res.locals.userId);
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
      //Send success response
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
    const { userId, taskId, taskname, description, priority } = req.body;

    // Find the user by userId and update the specific task within the task array
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId, "task._id": taskId }, // Find user by userId and task by taskId
      {
        $set: {
          "task.$.taskname": taskname, // Update taskname of the matched task
          "task.$.description": description, // Update description of the matched task
          "task.$.priority": priority,
        },
      },
      { new: true } // Return the updated document
    );

    // Check if user was found and task was updated successfully
    if (updatedUser) {
      return res.status(200).json({ userAndTasks: updatedUser });
    } else {
      return res.status(404).json({ message: "User or task not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//deleteTask function - delete task for a specific user
const deleteTask = async (req, res) => {
  const { userId, taskId } = req.body;
  try {
    const userAndTask = await UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: { task: { _id: taskId } },
      },
      { new: true }
    );
    if (userAndTask) {
      return res.json({ userAndTask });
    }

    return res.json({ error: "User not found" });
  } catch (error) {
    return res.json({ error: error.message });
  }
};

module.exports = { getTasks, postTask, updateTask, deleteTask };

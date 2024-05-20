const express = require("express");
const app = express();
const taskRouter = express.Router();
const taskController = require("../controllers/taskController.js");

//Get all tasks
taskRouter.get("/get-tasks", taskController.getTasks);

//Post task
taskRouter.post("/create-task", taskController.postTask);

//Put/Update task
taskRouter.put("/update-task", taskController.updateTask);

//delete task
taskRouter.post("/delete-task/:id", taskController.deleteTask);

//update task status
taskRouter.put("/update-status", taskController.updateTaskStatus);

//update task title
taskRouter.put("/update-title", taskController.updateTaskTitle);

module.exports = taskRouter;

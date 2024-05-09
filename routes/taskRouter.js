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
taskRouter.delete("/delete-task", taskController.deleteTask);

module.exports = taskRouter;

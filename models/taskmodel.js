const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    userId: String,
    task: { taskname: { type: String }, description: { type: String } },
  }
);

const TaskModel = mongoose.model("task", TaskSchema);

module.exports = TaskModel;

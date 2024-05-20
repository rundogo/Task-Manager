const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcryptjs");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
    default: "", // Default value for description
  },
  status: {
    type: String,
    default: "Not Started", // Default value for status
  },
  dueDate: {
    type: Date,
    default: null, // Default value for dueDate
  },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: [isEmail, "Please enter valid email address"],
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: [6, "Password must be 6 or more letters long"],
  },
  task: { type: [TaskSchema], default: [] },
});

//Middleware to encrypt password before saving it - Passwords should not be saved as plain text
UserSchema.pre("save", function (next) {
  const salt = bcrypt.genSaltSync();
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

//Static method to check Users Email
UserSchema.statics.checkEmail = function (email) {
  return this.findOne({ email });
};

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;

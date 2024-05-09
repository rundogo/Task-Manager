const UserModel = require("../models/usermodel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//render home page
const getLanding = async (req, res) => {
  res.render("landing");
};

//render home page
const getHome = async (req, res) => {
  res.render("home");
};

//render login page
const getLogin = async (req, res) => {
  res.render("login");
};

//render sign up page
const getSignup = async (req, res) => {
  res.render("signup");
};

//handle login post request
const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    //find user in DB
    const user = await UserModel.findOne({ email });
    let errorObject = {};
    if (user) {
      //If user email found
      //no email error
      errorObject.email = "";
      // check/compare passwords
      const auth = await bcrypt.compare(password, user.password);
      if (!auth) {
        //If incorrect password
        //email error
        errorObject.password = "Incorrect password";
        //return error object
        return res.json(errorObject);
      }
      //if user and password are correct
      //Create jwt token using user id from mongodb for browser cookies
      const token = createJWT(user._id);
      //set jwt token in cookies, httpOnly to restrict usage of token from browser, maxAge in milliseconds
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      //return userId;
      //return res.render("home");
      return res.json({ userId: user._id });
    }
    //User not found, append email error
    errorObject.email = "Email not found";
    errorObject.password = "";
    //return error object
    return res.json(errorObject);
  } catch (error) {
    console.log(error);
  }
};

//handle signup post request
//Email verification missing
const postSignup = async (req, res) => {
  try {
    //req.body contains sign up form details/values
    const { name, surname, email, password } = req.body;
    //save user in mongodb
    //Note that mongoose pre save middleware is used to hash (encrypt) the password before saving the sign up details
    const user = await UserModel.create({
      name,
      surname,
      email,
      password,
    });
    //Create jwt token using user id from mongodb for browser cookies
    const token = createJWT(user._id);
    //set jwt token in cookies, httpOnly to restrict usage of token from browser, maxAge in milliseconds
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });

    //return res.render("home");
    return res.json({ userId: user._id });
  } catch (error) {
    //handle other erros
    const errorObject = handleErrors(error);
    res.status(400).json(errorObject);
  }
};

//function for creating jwt token
const maxAge = 3 * 24 * 60 * 60; //3days
const createJWT = (id) => {
  //token is created from mongodb id and developer signature, expiry date of token is set as well
  return jwt.sign({ id }, "my task manager app", { expiresIn: maxAge });
};

//handle logout post request
const logout = async (get, res) => {
  // clear the cookie, set maxAge to 1ms
  res.cookie("jwt", "", { maxAge: 1 });
  //redirect to landing page
  res.redirect("/landing");
};

const getPasswordReset = async (req, res) => {
  res.render("password-reset");
};

//Password reset handling
//User submits email and new password, new password is compared against existing but missing part is that user should be able to receive a verification
//I am implementing the user lookup only for now and password reset without email verification

const postPasswordReset = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Check if user with provided email exists
    const user = await UserModel.checkEmail(email);

    if (!user) {
      return res
        .status(404)
        .json({ message: "Email not registered, please sign up" });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Generate a salt and hash the new password
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Update user's password in the database
    const userUpdated = await UserModel.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    return res.json(userUpdated);
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//error handler
const handleErrors = (error) => {
  console.log(error);
  const err = error.errors;
  const errorObject = {};
  //code block for other validation errors
  if (err) {
    for (key in err) {
      errorObject[err[key].properties.path] = err[key].properties.message;
    }
    return errorObject;
  }

  //code block for unique errors, unique errors don't return validator errors hence this separate handling
  const uniqueEmailError = error.errorResponse.code;
  if (uniqueEmailError == 11000) {
    errorObject["email"] = "Email already taken";
    return errorObject;
  }
};

module.exports = {
  getLanding,
  getHome,
  getLogin,
  getSignup,
  postLogin,
  postSignup,
  logout,
  getPasswordReset,
  postPasswordReset,
};

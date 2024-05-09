const express = require("express");
const app = express();
const authRouter = express.Router();
const authController = require("../controllers/authController");

//landing page request
authRouter.get("/landing", authController.getLanding);

//home page request
authRouter.get("/", authController.getHome);

//login page request
authRouter.get("/login", authController.getLogin);

//signup page request
authRouter.get("/signup", authController.getSignup);

//login in post request
authRouter.post("/login", authController.postLogin);

//signup post request
authRouter.post("/signup", authController.postSignup);

//logout request
authRouter.get("/logout", authController.logout);

//password reset request page
authRouter.get("/password-reset", authController.getPasswordReset);

//password reset post request
authRouter.post("/password-reset", authController.postPasswordReset);

module.exports = authRouter;

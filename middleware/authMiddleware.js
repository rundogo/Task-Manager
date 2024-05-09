const jwt = require("jsonwebtoken");

//Verify token before logging to user homepage
const requireAuth = (req, res, next) => {
  //Get token from req.cookies
  const token = req.cookies.jwt;
  //verify token
  jwt.verify(token, "my task manager app", (err, decodedToken) => {
    if (err) {
      //if token doesn't exist redirect page to landing page
      res.redirect("landing");
    } else {
      //if token exists, get userId from the decodedToken and add it to be part of body, to be used to identify user making requests to server
      res.locals.userId = decodedToken.id;
      next();
    }
  });
};

module.exports = { requireAuth };

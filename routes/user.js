const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
  .route("/signup")
  .get(userController.renderSignUpForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    //passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}) -> middleware used to authenticate user , parameters:-strategy used:"local",options: failureRedirect(if login falis , where to redirect) ; failureFlash(if fails it shows a flash)
    passport.authenticate("local", {
      //this function itsef uses .login - user gets assigned to req.user
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(userController.login),
  );

router.get("/logout", userController.logout); //in-built function in passport - it has parameter a call back function

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../model/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({
        username,
        email,
      });
      const registerdUser = await User.register(newUser, password);
      console.log(registerdUser);
      req.login(registerdUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings"); 
      }); //inbuilt method of passport to make user login with the help of credentials - user gets assigned to req.user , another parameter is a call back function to handle error
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  }),
);

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

//passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}) -> middleware used to authenticate user , parameters:-strategy used:"local",options: failureRedirect(if login falis , where to redirect) ; failureFlash(if fails it shows a flash)
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    //this function itsef uses .login - user gets assigned to req.user
    failureRedirect: "/login",
    failureFlash: true,
  }),
  wrapAsync(async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings"; // if the user clicks directly to loging(no existing url for redirection) , after login it will redirect to /listings
    res.redirect(redirectUrl);
  }),
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
}); //in-built function in passport - it has parameter a call back function

module.exports = router;

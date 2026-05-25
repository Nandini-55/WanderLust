const express = require("express");
const router = express.Router();
const User = require("../model/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

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
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
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
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  wrapAsync(async (req, res) => {
      req.flash("success", "Welcome back to Wanderlust!");
      res.redirect("/listings");
  }),
);
module.exports = router;

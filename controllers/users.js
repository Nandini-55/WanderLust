const User = require("../model/user.js");

module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
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
    // 1. Handle the unique database index restriction (Emails)
    if (err.code === 11000) {
      req.flash(
        "error",
        "A user with that email address is already registered.",
      );
    }
    // 2. Dynamically catches ALL other constraints (age, role, password requirements, etc.)
    else {
      req.flash("error", err.message);
    }
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  let redirectUrl = res.locals.redirectUrl || "/listings"; // if the user clicks directly to loging(no existing url for redirection) , after login it will redirect to /listings
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};

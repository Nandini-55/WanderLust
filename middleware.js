module.exports.isLoggedIn = (req, res, next) => {
  //console.log(req.user);//user is a property - if undefined then user is not logged in else it will has an object of user with its details
  if (!req.isAuthenticated()) {
    //redirectUrl save to let the user got to that page after getting logged in
    req.session.redirectUrl = req.originalUrl; //req body has multiple properties one of them is originalUrl which stores url f
    req.flash("error", "you must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  console.log(req.session.redirectUrl);
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl; //saving url where to redirect the user after log in
  }
  next();
};

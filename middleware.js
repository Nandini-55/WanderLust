const Listing = require("./model/listing");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js"); //imported to varify listings'and reviews' schema using joi-works as a middleware
const Review = require("./model/review.js");

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

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (
    res.locals.currUser &&
    !listing.owner._id.equals(res.locals.currUser._id)
  ) {
    req.flash("error", "You do not have permission to perform this operation!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

//validates listing schema - middleware function
module.exports.validateListing = (req, res, next) => {
  //middleware using joi to validate schema
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//validates review schema - middleware function
module.exports.validateReview = (req, res, next) => {
  //middleware using joi to validate schema
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { reviewId, id } = req.params;
  let review = await Review.findById(reviewId);
  if (
    res.locals.currUser &&
    !review.author._id.equals(res.locals.currUser._id)
  ) {
    req.flash("error", "You are not the author of this Review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

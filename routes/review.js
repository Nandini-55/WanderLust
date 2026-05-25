const express = require("express");
const router = express.Router({ mergeParams: true });
//{ mergeParams: true } - helps to get the access of parameters in route which were written before the given route
//e.g- before path  of following route : /listings/:id/reviews -- now the following routes can only be able to access the path after these details : but we require listings'id to access the Listings to add review in it - therefore , to have the access of paramter (like- :id) we have to use - { mergeParams: true }
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../model/listing.js");
const { reviewSchema } = require("../schema.js"); //imported to varify listings' schema using joi-works as a middlewa
const Review = require("../model/review.js");

//Reviews: doesn't require index and show route as reviews are part of listings
//validates review schema - middleware function
const validateReview = (req, res, next) => {
  //middleware using joi to validate schema
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Add Review route
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
  }),
);

//Delete review route
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
  }),
);

module.exports = router; //router stores all the routes

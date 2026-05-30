const express = require("express");
const router = express.Router({ mergeParams: true });
//{ mergeParams: true } - helps to get the access of parameters in route which were written before the given route
//e.g- before path  of following route : /listings/:id/reviews -- now the following routes can only be able to access the path after these details : but we require listings'id to access the Listings to add review in it - therefore , to have the access of paramter (like- :id) we have to use - { mergeParams: true }
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middlewares.js");
const reviewController = require("../controllers/reviews.js");
//Reviews: doesn't require index and show route as reviews are part of listings

//Add Review route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview),
);

//Delete review route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview),
);

module.exports = router; //router stores all the routes

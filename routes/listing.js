const express = require("express");
const router = express.Router();
const Listing = require("../model/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

//Index route
router.get("/", wrapAsync(listingController.index));

//new route-- this route must be before than the show one , else 'new' word would be considered as _id and will throw error
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Show route
router.get("/:id", wrapAsync(listingController.showListing));
//Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

//Create route
router.post(
  "/",
  validateListing, //middleware - helps to validate the schema of listing
  wrapAsync(listingController.createListing),
);

//Update route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingController.updateListing),
);

//Delete route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing),
);

//testing route
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "Wandy farmhouse",
//     description: "Surronded by the greenery",
//     print: 1200,
//     location: "Srinagar ,Kashmir",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("Sample was saved");
//   res.send("Successful testing");
// });

module.exports = router; //router stores all the routes

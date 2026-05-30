const express = require("express");
const router = express.Router();
const Listing = require("../model/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middlewares.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// * router.route(path)-  Returns an instance of a single route which you can then use to handle HTTP verbs with optional middleware. Use router. route() to avoid duplicate route naming and thus typing errors.

//Index route (.get) & Create route(.post)
router.route("/").get(wrapAsync(listingController.index)).post(
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing, //middleware - helps to validate the schema of listing
  wrapAsync(listingController.createListing),
);

//new route-- this route must be before than the show one , else 'new' word would be considered as _id and will throw error
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Show route(.get) & Update route(.put) & Delete route
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
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

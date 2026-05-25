const express = require("express");
const router = express.Router();
const Listing = require("../model/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js"); //imported to varify listings' schema using joi-works as a middleware

//validates listing schema - middleware function
const validateListing = (req, res, next) => {
  //middleware using joi to validate schema
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
  }),
);
//new route-- this route must be before than the show one , else 'new' word would be considered as _id and will throw error
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      res.redirect("/listings");
    } else {
      res.render("listings/show.ejs", { listing });
    }
  }),
);
//Edit route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      res.redirect("/listings");
    } else {
      res.render("listings/edit.ejs", { listing });
    }
  }),
);

//Create route
router.post(
  "/",
  validateListing, //middleware - helps to validate the schema of listing
  wrapAsync(async (req, res) => {
    // let { title, description, image, price, location, country } = req.body;// one way if the name of the input is just like these but to keep it simple , use listing[key] in new.ejs

    // if (!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing "); //400 - represents clients mistake
    // }-- replaced by joi 😎

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  }),
);

//Update route
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    // if (!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing "); //400 - represents clients mistake
    // }-- replaced by joi 😎 in middleware |-:"validateListing"
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  }),
);

//Delete route
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }),
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

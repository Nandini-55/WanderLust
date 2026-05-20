const express = require("express");
const mongoose = require("mongoose");
const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./model/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); //helps in creating templates - common in all webpages
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js"); //imported to varify listings' schema using joi-works as a middleware
const Review = require("./model/review.js");

main()
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.get("/", (req, res) => {
  res.redirect("/listings");
});
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

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

//Index route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
  }),
);
//new route-- this route must be before than the show one , else 'new' word would be considered as _id and will throw error
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  }),
);
//Edit route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  }),
);

//Create route
app.post(
  "/listings",
  validateListing, //middleware - helps to validate the schema of listing
  wrapAsync(async (req, res) => {
    // let { title, description, image, price, location, country } = req.body;// one way if the name of the input is just like these but to keep it simple , use listing[key] in new.ejs

    // if (!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing "); //400 - represents clients mistake
    // }-- replaced by joi 😎

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  }),
);

//Update route
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    // if (!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing "); //400 - represents clients mistake
    // }-- replaced by joi 😎 in middleware |-:"validateListing"
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }),
);

//Delete route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`);
  }),
);

//Reviews: doesn't require index and show route as reviews are part of listings

//Add Review route
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
  }),
);

//Delete review route
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
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

//page not found route - not an appropriate route
//used "/*splat" instead of "*" as express v5 doesn't use it as for all routes
app.all("/*splat", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong !" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen("5000", () => {
  console.log("Server is listening to port 5000");
});

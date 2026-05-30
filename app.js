if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dbUrl = process.env.ATLASDB_URL;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); //helps in creating templates - common in all webpages
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash"); //used to display one time messages
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user.js");

main()
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
const store = MongoStore.create({
  //their will be session collection in database
  //default session is of 14 days
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, //interval between session updates in seconds - it helps to retian data without updating it when their is no update
});

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE ", err);
});

const sessionOptions = {
  store, //as using session storage "MemoryStore"  is not appropriate for production level as it can't handle large data and only is for debugging and development
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    //following settings helps to retain the cookies even if the web browser is exited
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // millliseconds in 7 days - cookies will be saved for 7 days - Expires defines an exact HTTP-date and time (e.g., Wed, 21 Oct 2026 07:28:00 GMT)
    maxAge: 7 * 24 * 60 * 60 * 1000, //Max-Age defines the lifetime of a cookie or session in seconds. I
    httpOnly: true, //prevents from cross scripting attacks
  },
};

app.use(session(sessionOptions));
app.use(flash()); //setting flash as middleware
app.use(passport.initialize()); //middleware for each request\
app.use(passport.session()); //Helps to identify  the user is the same or not
passport.use(new LocalStrategy(User.authenticate())); //Ensure all users are authenticated through local strategy, and local strategy uses authenticate function of user model to verify the user.
passport.serializeUser(User.serializeUser()); //The store of the session
passport.deserializeUser(User.deserializeUser()); //Remove user from session

app.use((req, res, next) => {
  //stores properties to let the ejs template access them
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; //stores the user property of request body in locals
  next();
});

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "student101",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld"); // Register method can take three parameters as input: User Details, Password and Callback(optional) And store them in the database.
//   res.send(registeredUser);
// });

app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);

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

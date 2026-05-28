const Listing = require("../model/listing");

module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } }) //populate with review and populate each review with its author
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    res.redirect("/listings");
  } else {
    res.render("listings/show.ejs", { listing });
  }
};

module.exports.createListing = async (req, res, next) => {
  // let { title, description, image, price, location, country } = req.body;// one way if the name of the input is just like these but to keep it simple , use listing[key] in new.ejs

  // if (!req.body.listing) {
  //   throw new ExpressError(400, "Send valid data for listing "); //400 - represents clients mistake
  // }-- replaced by joi 😎
  try {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    return res.redirect("/listings");
  } catch (err) {
    if (err.code === 11000) {
      req.flash(
        "error",
        "A listing with that title already exists. Please choose a unique name!",
      );
      return res.redirect("/listings/new"); // Redirects back to the creation form
    }
  }
  next(err);
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    res.redirect("/listings");
  } else {
    res.render("listings/edit.ejs", { listing });
  }
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

module.exports.updateListing = async (req, res) => {
  // if (!req.body.listing) {
  //   throw new ExpressError(400, "Send valid data for listing "); //400 - represents clients mistake
  // }-- replaced by joi 😎 in middleware |-:"validateListing"
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

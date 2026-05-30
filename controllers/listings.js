const Listing = require("../model/listing");
const maptiler = require("@maptiler/client");
maptiler.config.apiKey = process.env.MAP_TOKEN;

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
    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url, "..", filename);
    //map coordiantes:
    const result = await maptiler.geocoding.forward(req.body.listing.location);
    // console.log(result.features[0].geometry);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = result.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
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
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;

  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250"); //decrease pixel size for preview to reduce render time
  res.render("listings/edit.ejs", { listing, originalImageUrl });
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
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    //if no image is uploaded - req.file=undefined = false
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

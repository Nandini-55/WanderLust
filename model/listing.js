const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default:
      "https://unsplash.com/photos/a-white-house-with-a-porch-and-a-balcony-FGwmU5tfwZw",
       set: (v) =>
      v === ""
        ? "https://unsplash.com/photos/a-white-house-with-a-porch-and-a-balcony-FGwmU5tfwZw"
        : v,
    },
    
  },
  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
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
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review", //review model is the reference for each review
    },
  ],
});
listingSchema.post("findOneAndDelete", async () => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

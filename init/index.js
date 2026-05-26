// this fill is to initialise the data
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../model/listing.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
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

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6a145fca046901627cb501b1",
  }));//added owner to each allready existing listings with the above object id of user.
  await Listing.insertMany(initData.data);
  console.log("Data was initialised");
};

initDB();

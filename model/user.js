const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;//It adds skills like user name, hash, and salt by default. Moreover, it provides some functions like set password, change password, etc. 
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});
userSchema.plugin(passportLocalMongoose); // this will add username , hash value and salt feild in db by default

module.exports = mongoose.model("User", userSchema);

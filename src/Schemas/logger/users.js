const { model, Schema } = require("mongoose");

let users = new Schema({
  Guild: String,
  User: String,
  Name: String,
  Created: Date,
  Nickname: String,
  Avatar: String, // same as member?
  Banner: String,
  DM: Boolean,
});

module.exports = model("users", users);

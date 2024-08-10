const { model, Schema } = require("mongoose");

let members = new Schema({
  Guild: String,
  User: String, // users = members
  Name: String,
  Nickname: String,
  Displayname: String,
  Avatar: String,
  Banner: String,
  Roles: [String],
  Joined: Date,
  Created: Date,
});

module.exports = model("members", members);

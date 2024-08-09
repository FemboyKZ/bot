const { model, Schema } = require("mongoose");

let members = new Schema({
  Guild: String,
  User: String,
  Perms: String,
  Roles: [String],
  Joined: Date,
  Name: String,
  Nickname: String,
  Avatar: String,
  Type: String,
});

module.exports = model("members", members);

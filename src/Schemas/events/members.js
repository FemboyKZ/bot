const { model, Schema } = require("mongoose");

let members = new Schema({
  Guild: { type: String, required: true },
  User: { type: String, unique: true, required: true }, // users = members
  Name: { type: String, default: null },
  Nickname: { type: String, default: null },
  Displayname: { type: String, default: null },
  Avatar: { type: String, default: null }, // URL
  Banner: { type: String, default: null }, // URL
  Roles: { type: Array, default: [] },
  Joined: { type: Date, default: Date.now },
  Created: { type: Date, default: null },
});

module.exports = model("members", members);

const { model, Schema } = require("mongoose");

let members = new Schema({
  Guild: { type: String, required: true },
  User: { type: String, required: true },
  Name: { type: String, required: true },
  Nickname: { type: String, default: "" },
  Displayname: { type: String, default: "" },
  Avatar: { type: String, default: null },
  Banner: { type: String, default: null },
  Roles: { type: [String], default: [] },
  Joined: { type: Date, default: Date.now },
  Created: { type: Date, default: null },
});

members.index({ Guild: 1, User: 1 }, { unique: true });

module.exports = model("members", members);

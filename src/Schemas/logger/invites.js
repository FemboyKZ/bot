const { model, Schema } = require("mongoose");

let invites = new Schema({
  Guild: String,
  Invite: String,
  User: String, // creator
  Permanent: Boolean,
  Expires: Date,
  Created: Date,
  Code: String,
});

module.exports = model("invites", invites);

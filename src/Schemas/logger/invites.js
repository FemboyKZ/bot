const { model, Schema } = require("mongoose");

let invites = new Schema({
  Guild: String,
  Invite: String, // invite.code
  User: String, // creator
  Uses: Number,
  MaxUses: Number,
  Permanent: Boolean,
  Expires: Date,
  Created: Date,
});

module.exports = model("invites", invites);

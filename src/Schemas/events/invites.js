const { model, Schema } = require("mongoose");

let invites = new Schema({
  Guild: { type: String, required: true },
  Invite: { type: String, unique: true, required: true }, // invite.code
  User: { type: String, default: null }, // creator
  Uses: { type: Number, default: null },
  MaxUses: { type: Number, default: null },
  Permanent: { type: Boolean, default: null },
  Expires: { type: Date, default: null },
  Created: { type: Date, default: Date.now },
});

module.exports = model("invites", invites);

const { model, Schema } = require("mongoose");

let reactionRoles = new Schema({
  Guild: { type: String, required: true },
  Message: { type: String, required: true },
  Emoji: { type: String, required: true },
  Role: { type: String, required: true },
});

reactionRoles.index({ Guild: 1, Message: 1, Emoji: 1 }, { unique: true });

module.exports = model("reactionRoles", reactionRoles);

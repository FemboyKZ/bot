const { model, Schema } = require("mongoose");

let reactionRoles = new Schema({
  Guild: { type: String, required: true },
  Message: { type: String, required: true },
  Emoji: { type: String, required: true },
  Role: { type: String, required: true },
});

module.exports = model("reactionRoles", reactionRoles);

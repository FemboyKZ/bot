const { model, Schema } = require("mongoose");

let emojis = new Schema({
  Guild: String,
  Emoji: String, // ID
  User: String, // creator
  Animated: Boolean,
  Created: Date,
});

module.exports = model("emojis", emojis);

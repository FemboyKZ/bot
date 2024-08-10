const { model, Schema } = require("mongoose");

let emojis = new Schema({
  Guild: String,
  Emoji: String, // ID
  Name: String,
  User: String, // creator
  Animated: Boolean,
  Created: Date,
  Image: String,
});

module.exports = model("emojis", emojis);

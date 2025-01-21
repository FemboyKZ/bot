const { model, Schema } = require("mongoose");

let emojis = new Schema({
  Guild: { type: String, default: null },
  Emoji: { type: String, unique: true, required: true }, // ID
  Name: { type: String, default: null },
  User: { type: String, default: null }, // creator
  Animated: { type: Boolean, default: null },
  Created: { type: Date, default: Date.now },
  Image: { type: String, default: null }, // URL
});

module.exports = model("emojis", emojis);

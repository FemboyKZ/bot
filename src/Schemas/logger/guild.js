const { model, Schema } = require("mongoose");

let guild = new Schema({
  Guild: String,
  Name: String,
  Owner: String,
  Created: Date,
  Icon: String,
  Banner: String,
  Vanity: String,
  Channels: [String],
  Emojis: [String],
  Stickers: [String],
  Roles: [String],
  Members: [String],
  Messages: Number,
});

module.exports = model("guild", guild);

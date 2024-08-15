const { model, Schema } = require("mongoose");

let settings = new Schema({
  Guild: String,
  Post: Boolean, // post in channel?
  Store: Boolean, // store in db?
  Automod: Boolean,
  Bans: Boolean,
  Channels: Boolean,
  Emojis: Boolean,
  Info: Boolean, // guild info
  Invites: Boolean,
  Interactions: Boolean,
  Members: Boolean,
  Users: Boolean,
  Messages: Boolean,
  Roles: Boolean,
  Stickers: Boolean,
  Threads: Boolean,
});

module.exports = model("settings", settings);

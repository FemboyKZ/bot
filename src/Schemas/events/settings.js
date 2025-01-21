const { model, Schema } = require("mongoose");

let settings = new Schema({
  Guild: { type: String, unique: true, required: true },
  Post: { type: Boolean, default: true }, // post in channel?
  Store: { type: Boolean, default: true }, // store in db?
  Automod: { type: Boolean, default: true },
  Bans: { type: Boolean, default: true },
  Channels: { type: Boolean, default: true },
  Emojis: { type: Boolean, default: true },
  Info: { type: Boolean, default: true }, // guild info
  Invites: { type: Boolean, default: true },
  Interactions: { type: Boolean, default: true },
  Members: { type: Boolean, default: true },
  Users: { type: Boolean, default: true },
  Messages: { type: Boolean, default: true },
  Roles: { type: Boolean, default: true },
  Stickers: { type: Boolean, default: true },
  Threads: { type: Boolean, default: true },
});

module.exports = model("settings", settings);

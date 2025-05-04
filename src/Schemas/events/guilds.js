const { model, Schema } = require("mongoose");

let guilds = new Schema({
  Guild: { type: String, unique: true, required: true }, // ID
  Name: { type: String, default: null },
  User: { type: String, default: null }, // creator/owner
  Created: { type: Date, default: null },
  Icon: { type: String, default: null }, // URL
  Banner: { type: String, default: null }, // URL
  Vanity: { type: String, default: null },
  Channels: { type: Array, default: [] },
  Emojis: { type: Array, default: [] },
  Stickers: { type: Array, default: [] },
  Roles: { type: Array, default: [] },
  Members: { type: Array, default: [] },
});

module.exports = model("guilds", guilds);

const { model, Schema } = require("mongoose");

let guilds = new Schema({
  Guild: { type: String, unique: true, required: true },
  Name: { type: String, default: null },
  User: { type: String, default: null },
  Created: { type: Date, default: null },
  Icon: { type: String, default: null },
  Banner: { type: String, default: null },
  Vanity: { type: String, default: null },
  Channels: { type: [String], default: [] },
  Emojis: { type: [String], default: [] },
  Stickers: { type: [String], default: [] },
  Roles: { type: [String], default: [] },
  Members: { type: [String], default: [] },
});

module.exports = model("guilds", guilds);

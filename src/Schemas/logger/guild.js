const { model, Schema } = require("mongoose");

let guild = new Schema({
  Guild: { type: String, unique: true, required: true }, // ID
  Name: { type: String, default: null },
  Owner: { type: String, default: null },
  Created: { type: Date, default: null },
  Icon: { type: String, default: null }, // URL
  Banner: { type: String, default: null }, // URL
  Vanity: { type: String, default: null },
  Channels: { type: [String], default: [] },
  Emojis: { type: [String], default: [] },
  Stickers: { type: [String], default: [] },
  Roles: { type: [String], default: [] },
  Members: { type: [String], default: [] },
  Messages: { type: Number },
});

module.exports = model("guild", guild);

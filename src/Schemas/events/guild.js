const { model, Schema } = require("mongoose");

let guild = new Schema({
  Guild: { type: String, unique: true, required: true }, // ID
  Name: { type: String, default: null },
  User: { type: String, default: null }, // creator/owner
  Created: { type: Date, default: null },
  Icon: { type: String, default: null }, // URL
  Banner: { type: String, default: null }, // URL
  Vanity: { type: String, default: null },
  Channels: { type: [String], default: [] },
  Emojis: { type: [String], default: [] },
  Stickers: { type: [String], default: [] },
  Roles: { type: [String], default: [] },
  Members: { type: [String], default: [] },
});

module.exports = model("guild", guild);

const { model, Schema } = require("mongoose");

let roles = new Schema({
  Guild: { type: String, required: true },
  Role: { type: String, unique: true, required: true }, // ID
  Name: { type: String, default: null },
  Color: { type: String, default: null },
  Hoist: { type: Boolean, default: false },
  Mentionable: { type: Boolean, default: false },
  Permissions: { type: [String], default: [] },
  Position: { type: Number, default: 0 },
  Created: { type: Date, default: Date.now },
});

module.exports = model("roles", roles);

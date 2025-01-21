const { model, Schema } = require("mongoose");

let roles = new Schema({
  Guild: { type: String, required: true },
  Role: { type: String, unique: true, required: true }, // ID
  Name: { type: String, default: null },
  Permissions: { type: [String], default: [] },
  Color: { type: String, default: null },
  Created: { type: Date, default: Date.now },
});

module.exports = model("roles", roles);

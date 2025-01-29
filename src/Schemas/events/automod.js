const { model, Schema } = require("mongoose");

let automod = new Schema({
  Guild: { type: String, required: true },
  Rule: { type: String, unique: true, required: true }, // ID
  User: { type: String, default: null }, // creator
  Name: { type: String, default: null },
  Created: { type: Date, default: Date.now },
  Enabled: { type: Boolean, default: null },
  Triggers: { type: [String], default: [] },
  Actions: { type: [String], default: [] },
});

module.exports = model("automod", automod);

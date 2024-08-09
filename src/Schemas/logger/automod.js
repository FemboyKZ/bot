const { model, Schema } = require("mongoose");

let automod = new Schema({
  Guild: String,
  Rule: String, // ID
  Name: String,
  User: String, // creator
  Created: Date,
  Enabled: Boolean,
  Rules: [Object],
});

module.exports = model("automod", automod);

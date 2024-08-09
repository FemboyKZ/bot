const { model, Schema } = require("mongoose");

let automod = new Schema({
  Guild: String,
  Rule: String, // ID
  Name: String,
  Created: Date,
  Enabled: Boolean,
  Trigger: String,
  Action: String,
});

module.exports = model("automod", automod);

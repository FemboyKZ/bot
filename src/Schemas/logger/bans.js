const { model, Schema } = require("mongoose");

let bans = new Schema({
  Guild: { type: String, required: true },
  User: { type: String, unique: true, required: true }, // ID or username
  Created: { type: Date, default: Date.now },
  Reason: { type: String, default: null },
});

module.exports = model("bans", bans);

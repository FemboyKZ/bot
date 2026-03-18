const { model, Schema } = require("mongoose");

let bans = new Schema({
  Guild: { type: String, required: true },
  User: { type: String, required: true },
  Created: { type: Date, default: Date.now },
  Reason: { type: String, default: null },
});

bans.index({ Guild: 1, User: 1 }, { unique: true });

module.exports = model("bans", bans);

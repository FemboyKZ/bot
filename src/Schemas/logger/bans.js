const { model, Schema } = require("mongoose");

let bans = new Schema({
  Guild: String,
  User: String,
  Created: Date,
  Executor: String,
  Expired: Boolean,
  Reason: String,
});

module.exports = model("bans", bans);

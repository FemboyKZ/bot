const { model, Schema } = require("mongoose");

let bans = new Schema({
  Guild: String,
  User: String,
  Executor: String,
  Permanent: Boolean,
  Expires: Date,
  Reason: String,
});

module.exports = model("bans", bans);

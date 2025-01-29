const { model, Schema } = require("mongoose");

let mutes = new Schema({
  Guild: { type: String, required: true },
  User: { type: String, unique: true, required: true },
  Duration: { type: String, default: null },
  Reason: { type: String, default: null },
  Executor: { type: String, default: null },
});

module.exports = model("mutes", mutes);

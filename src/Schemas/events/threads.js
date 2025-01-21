const { model, Schema } = require("mongoose");

let threads = new Schema({
  Guild: { type: String, default: null },
  Thread: { type: String, unique: true, required: true }, // ID
  User: { type: String, default: null }, // creator
  Locked: { type: Boolean, default: null },
  Archived: { type: Boolean, default: null },
  Auto: { type: String, default: null }, // auto archive time
  Parent: { type: String, default: null }, // channel
});

module.exports = model("threads", threads);

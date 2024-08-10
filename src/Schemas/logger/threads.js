const { model, Schema } = require("mongoose");

let threads = new Schema({
  Guild: String,
  Thread: String,
  User: String, // creator
  Locked: Boolean,
  Archived: Boolean,
  Auto: String, // auto archive time
  Parent: String, // channel
});

module.exports = model("threads", threads);

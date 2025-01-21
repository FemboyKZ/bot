const { model, Schema } = require("mongoose");

let reaction = new Schema({
  Guild: { type: String, required: true },
  Message: { type: String, required: true },
  Emoji: { type: String, required: true },
  Role: { type: String, required: true },
});

module.exports = model("rrs", reaction);

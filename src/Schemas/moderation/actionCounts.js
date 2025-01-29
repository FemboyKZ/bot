const { model, Schema } = require("mongoose");

let actionCounts = new Schema({
  Guild: { type: String, required: true },
  User: { type: String, required: true },
  Type: { type: String, required: true }, // spam, ping, etc.
  Number: { type: Number, default: 0 },
});

module.exports = model("actionCounts", actionCounts);

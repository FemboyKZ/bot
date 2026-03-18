const { model, Schema } = require("mongoose");

let actionCounts = new Schema({
  Guild: { type: String, required: true },
  User: { type: String, required: true },
  Type: { type: String, required: true },
  Number: { type: Number, default: 0 },
});

actionCounts.index({ Guild: 1, User: 1, Type: 1 }, { unique: true });

module.exports = model("actionCounts", actionCounts);

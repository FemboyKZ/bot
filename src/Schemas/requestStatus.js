const { model, Schema } = require("mongoose");

let requestStatus = new Schema({
  User: { type: String, required: true },
  Type: { type: String, required: true },
  Message: { type: String, required: true },
  Status: { type: Boolean, default: null },
});

requestStatus.index({ User: 1, Type: 1 }, { unique: true });

module.exports = model("requestStatus", requestStatus);

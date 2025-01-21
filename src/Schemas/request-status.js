const { model, Schema } = require("mongoose");

let requestStatus = new Schema({
  User: { type: String, unique: true, required: true },
  Type: { type: String, required: true },
  Status: { type: Boolean, default: null },
});

module.exports = model("requestStatus", requestStatus);

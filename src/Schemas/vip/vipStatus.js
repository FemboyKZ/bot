const { model, Schema } = require("mongoose");

let vipStatus = new Schema({
  Claimer: { type: String, unique: true, required: true }, // user ID
  Status: { type: Boolean, default: null },
  Type: { type: String, required: true },
  Gifted: { type: Boolean, default: null },
  Steam: { type: String, required: true },
  Date: { type: Date, default: Date.now },
});

module.exports = model("vipStatus", vipStatus);

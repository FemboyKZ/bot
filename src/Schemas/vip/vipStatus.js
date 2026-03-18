const { model, Schema } = require("mongoose");

let vipStatus = new Schema({
  Claimer: { type: String, required: true },
  Status: { type: Boolean, default: null },
  Type: { type: String, required: true },
  Gifted: { type: Boolean, default: null },
  Steam: { type: String, required: true },
  Date: { type: Date, default: Date.now },
});

vipStatus.index({ Claimer: 1, Type: 1 }, { unique: true });

module.exports = model("vipStatus", vipStatus);

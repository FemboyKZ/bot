const { model, Schema } = require("mongoose");

let vipCodes = new Schema({
  Guild: { type: String, required: true },
  Code: { type: String, unique: true, required: true },
  Type: { type: String, required: true },
  Uses: { type: Number, default: 0 },
});

module.exports = model("vipCodes", vipCodes);

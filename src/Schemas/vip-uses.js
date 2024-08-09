const { model, Schema } = require("mongoose");

let vipCodes = new Schema({
  Guild: String,
  Code: String,
  Type: String,
  Uses: Number,
});

module.exports = model("vipCodes", vipCodes);

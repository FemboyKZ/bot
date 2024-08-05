const { model, Schema } = require("mongoose");

let vipUsesSchema = new Schema({
  Guild: String,
  Code: String,
  Type: String,
  Uses: Number,
});

module.exports = model("vipUsesSchema", vipUsesSchema);

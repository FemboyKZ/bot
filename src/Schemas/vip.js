const { model, Schema } = require("mongoose");

let vipSchema = new Schema({
  Guild: String,
  Channel: String,
});

module.exports = model("vipSchema", vipSchema);

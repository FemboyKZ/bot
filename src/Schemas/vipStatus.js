const { model, Schema } = require("mongoose");

let vipStatusSchema = new Schema({
  Claimer: String,
  Status: Boolean,
  Type: String,
  Gifted: Boolean,
  Steam: String,
  Date: Date,
});

module.exports = model("vipStatusSchema", vipStatusSchema);

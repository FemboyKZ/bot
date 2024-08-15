const { model, Schema } = require("mongoose");

let vipStatus = new Schema({
  Claimer: String,
  Status: Boolean,
  Type: String,
  Gifted: Boolean,
  Steam: String,
  Date: Date,
});

module.exports = model("vipStatus", vipStatus);

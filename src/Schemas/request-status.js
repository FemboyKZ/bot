const { model, Schema } = require("mongoose");

let requestStatus = new Schema({
  User: String,
  Type: String,
  Status: Boolean,
});

module.exports = model("requestStatus", requestStatus);

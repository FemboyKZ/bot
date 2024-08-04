const { model, Schema } = require("mongoose");

let whitelistStatusSchema = new Schema({
  Request: String,
  Status: Boolean,
});

module.exports = model("whitelistStatusSchema", whitelistStatusSchema);

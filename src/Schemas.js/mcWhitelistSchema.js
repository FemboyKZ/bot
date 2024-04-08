const { model, Schema } = require("mongoose");

let mcWhitelistSchema = new Schema({
  Guild: String,
  Channel: String,
});

module.exports = model("mcWhitelistSchema", mcWhitelistSchema);

import { model, Schema } from "mongoose";

let whitelistSchema = new Schema({
  Guild: String,
  Channel: String,
});

module.exports = model("whitelistSchema", whitelistSchema);

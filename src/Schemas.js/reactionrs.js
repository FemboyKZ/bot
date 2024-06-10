import { model, Schema } from "mongoose";

let reaction = new Schema({
  Guild: String,
  Message: String,
  Emoji: String,
  Role: String,
});

module.exports = model("rrs", reaction);

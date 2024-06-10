import { model, Schema } from "mongoose";

let unbanSchema = new Schema({
  Guild: String,
  Channel: String,
});

module.exports = model("unbanSchema", unbanSchema);

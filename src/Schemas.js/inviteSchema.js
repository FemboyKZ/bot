import { model, Schema } from "mongoose";

let inviteSchema = new Schema({
  Guild: String,
  Channel: String,
});

module.exports = model("invite", inviteSchema);

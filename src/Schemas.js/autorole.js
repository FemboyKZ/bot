import { model, Schema } from "mongoose";

let autorole = new Schema({
  Guild: String,
  Role: String,
});

module.exports = model("autorole", autorole);

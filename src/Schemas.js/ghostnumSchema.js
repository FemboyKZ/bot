import { model, Schema } from "mongoose";

let numSchema = new Schema({
  Guild: String,
  User: String,
  Number: Number,
});

module.exports = model("ghostNum", numSchema);

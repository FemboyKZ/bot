import { model, Schema } from "mongoose";

let ghostSchema = new Schema({
  Guild: String,
});

module.exports = model("ghost", ghostSchema);

import { model, Schema } from "mongoose";

let reportSchema = new Schema({
  Guild: String,
  Channel: String,
});

module.exports = model("reportSchema", reportSchema);

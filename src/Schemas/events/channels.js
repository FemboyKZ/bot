const { model, Schema } = require("mongoose");

let channels = new Schema({
  Guild: { type: String, default: null }, // can be non guild?
  Channel: { type: String, unique: true, required: true }, // ID
  Name: { type: String, default: null },
  Parent: { type: String, default: null }, // Category
  Type: { type: String, default: null }, // Text/Voice etc
  Topic: { type: String, default: null },
});

module.exports = model("channels", channels);

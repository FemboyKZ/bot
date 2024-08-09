const { model, Schema } = require("mongoose");

let channels = new Schema({
  Guild: String,
  Channel: String, // ID
  Name: String,
  Parent: String, // Category
  Type: String, // Text/Voice etc
});

module.exports = model("channels", channels);

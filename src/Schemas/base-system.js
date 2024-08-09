const { model, Schema } = require("mongoose");

let baseSchema = new Schema({
  Guild: String,
  Channel: String,
  ID: String,
});

module.exports = model("baseSchema", baseSchema);

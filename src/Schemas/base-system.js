const { model, Schema } = require("mongoose");

let baseSchema = new Schema({
  Guild: { type: String, required: true },
  Channel: { type: String, required: true },
  ID: { type: String, required: true },
});

module.exports = model("baseSchema", baseSchema);

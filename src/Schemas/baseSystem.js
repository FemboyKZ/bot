const { model, Schema } = require("mongoose");

let baseSchema = new Schema({
  Guild: { type: String, required: true },
  Channel: { type: String, required: true },
  ID: { type: String, required: true },
});

baseSchema.index({ Guild: 1, ID: 1 }, { unique: true });

module.exports = model("baseSchema", baseSchema);

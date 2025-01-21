const { model, Schema } = require("mongoose");

let numSchema = new Schema({
  Guild: { type: String },
  User: { type: String },
  Number: { type: Number },
});

module.exports = model("ghostNum", numSchema);

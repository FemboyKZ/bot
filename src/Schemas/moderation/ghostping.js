const { model, Schema } = require("mongoose");

let ghostSchema = new Schema({
  Guild: { type: String, unique: true, required: true },
});

module.exports = model("ghost", ghostSchema);

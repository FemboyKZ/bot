const { model, Schema } = require("mongoose");

let processedMembers = new Schema({
  Guild: String,
  Channel: String,
});

module.exports = model("processedMembers", processedMembers);

const { model, Schema } = require("mongoose");

let muteRoles = new Schema({
  Guild: { type: String, unique: true, required: true }, // ID
  Role: { type: String, required: true }, // ID
});

module.exports = model("muteRoles", muteRoles);

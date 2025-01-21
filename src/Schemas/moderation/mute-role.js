const { model, Schema } = require("mongoose");

let muteRoleSchema = new Schema({
  Guild: { type: String, unique: true, required: true }, // ID
  Role: { type: String, required: true }, // ID
});

module.exports = model("muteRoleSchema", muteRoleSchema);

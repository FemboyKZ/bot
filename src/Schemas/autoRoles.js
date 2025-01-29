const { model, Schema } = require("mongoose");

let autoRoles = new Schema({
  Guild: { type: String, unique: true, required: true },
  Roles: { type: Array, default: [] },
});

module.exports = model("autoRoles", autoRoles);

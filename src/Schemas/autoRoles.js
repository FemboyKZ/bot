const { model, Schema } = require("mongoose");

let autoRoles = new Schema({
  Guild: { type: String, unique: true, required: true },
  Roles: { type: [String], default: [] },
});

module.exports = model("autoRoles", autoRoles);

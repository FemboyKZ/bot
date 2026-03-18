const { model, Schema } = require("mongoose");

let vipRoles = new Schema({
  Guild: { type: String, required: true },
  Type: { type: String, required: true },
  Role: { type: String, required: true },
});

vipRoles.index({ Guild: 1, Type: 1 }, { unique: true });

module.exports = model("vipRoles", vipRoles);

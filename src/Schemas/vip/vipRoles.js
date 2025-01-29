const { model, Schema } = require("mongoose");

let vipRoles = new Schema({
  Guild: { type: String, required: true },
  Type: { type: String, required: true, unique: true },
  Role: { type: String, required: true },
});

module.exports = model("vipRoles", vipRoles);

const { model, Schema } = require("mongoose");

let vipRoles = new Schema({
  Guild: String,
  Type: String,
  Role: String,
});

module.exports = model("vipRoles", vipRoles);

const { model, Schema } = require("mongoose");

let muteRoleSchema = new Schema({
  Guild: String,
  Role: String,
});

module.exports = model("muteRoleSchema", muteRoleSchema);

const { model, Schema } = require("mongoose");

let autorole = new Schema({
  Guild: String,
  Roles: [String],
});

module.exports = model("autorole", autorole);

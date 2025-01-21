const { model, Schema } = require("mongoose");

let autorole = new Schema({
  Guild: { type: String, unique: true, required: true },
  Roles: { type: [String], default: [] },
});

module.exports = model("autorole", autorole);

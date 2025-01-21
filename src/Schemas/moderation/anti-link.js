const { model, Schema } = require("mongoose");

let antiLink = new Schema({
  Guild: { type: String, unique: true, required: true },
  Perms: { type: String, required: true },
});

module.exports = model("antiLink", antiLink);

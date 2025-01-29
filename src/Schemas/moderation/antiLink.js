const { model, Schema } = require("mongoose");

// Could be integrated into general schemas

let antiLink = new Schema({
  Guild: { type: String, unique: true, required: true },
  Perms: { type: String, required: true }, // Perms required for bypassing antiLink
});

module.exports = model("antiLink", antiLink);

const { model, Schema } = require("mongoose");

let antiLink = new Schema({
  Guild: String,
  Perms: String,
});

module.exports = model("antiLink", antiLink);

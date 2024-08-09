const { model, Schema } = require("mongoose");

let stickers = new Schema({
  Guild: String,
  Sticker: String,
  User: String, // creator
  Created: Date,
  Description: String,
});

module.exports = model("stickers", stickers);

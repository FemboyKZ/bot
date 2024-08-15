const { model, Schema } = require("mongoose");

let stickers = new Schema({
  Guild: String,
  Sticker: String,
  Name: String,
  Created: Date,
  Description: String,
  Available: Boolean,
});

module.exports = model("stickers", stickers);

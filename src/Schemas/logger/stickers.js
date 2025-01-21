const { model, Schema } = require("mongoose");

let stickers = new Schema({
  Guild: { type: String, default: null }, // ID
  Sticker: { type: String, unique: true, required: true }, // ID
  Name: { type: String, default: null },
  Created: { type: Date, default: Date.now },
  Description: { type: String, default: null },
  Available: { type: Boolean, default: null },
});

module.exports = model("stickers", stickers);

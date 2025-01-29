const { model, Schema } = require("mongoose");

let stickers = new Schema({
  Guild: { type: String, default: null }, // ID
  Sticker: { type: String, unique: true, required: true }, // ID
  Name: { type: String, default: null },
  Description: { type: String, default: null },
  Tags: { type: Array, default: [] },
  Available: { type: Boolean, default: null },
  Created: { type: Date, default: Date.now },
});

module.exports = model("stickers", stickers);

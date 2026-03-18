const { model, Schema } = require("mongoose");

let stickers = new Schema({
  Guild: { type: String, default: null },
  Sticker: { type: String, unique: true, required: true },
  Name: { type: String, default: null },
  Description: { type: String, default: null },
  Tags: { type: [String], default: [] },
  Available: { type: Boolean, default: null },
  Created: { type: Date, default: Date.now },
});

module.exports = model("stickers", stickers);

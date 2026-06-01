const { model, Schema } = require("mongoose");

// deleted and edited msgs only
let messages = new Schema({
  Guild: { type: String, default: null },
  User: { type: String, required: true }, // users = members
  Channel: { type: String, default: null },
  Message: { type: String, unique: true, required: true }, // ID
  Content: { type: Array, default: [] }, // store each version of msg, only 1 if deleted
  Images: { type: Array, default: [] }, // media URLs (attachments + stickers)
  ReplyTo: { type: String, default: null }, // message ID this msg replied to
  ReplyToUser: { type: String, default: null }, // user ID this msg replied to
  Created: { type: Date, default: null },
  Edited: { type: Date, default: null },
  Deleted: { type: Date, default: null },
  Edits: { type: Number, default: null },
});

module.exports = model("messages", messages);

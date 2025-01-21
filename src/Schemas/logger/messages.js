const { model, Schema } = require("mongoose");

// deleted and edited msgs only
let messages = new Schema({
  Guild: { type: String, default: null },
  User: { type: String, required: true }, // users = members
  Channel: { type: String, default: null },
  Message: { type: String, unique: true, required: true }, // ID
  Content: { type: [String], default: [] }, // store each version of msg, only 1 if deleted
  Images: { type: [String], default: [] }, // URL
  Created: { type: Date, default: null },
  Edited: { type: Date, default: null },
  Deleted: { type: Date, default: null },
  Edits: { type: Number, default: null },
});

module.exports = model("messages", messages);

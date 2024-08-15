const { model, Schema } = require("mongoose");

// deleted and edited msgs only
let messages = new Schema({
  Guild: String,
  User: String, // users = members
  Channel: String,
  Message: String, // ID
  Content: [String], // store each version of msg, only 1 if deleted
  Images: [String], // image urls, storing files would be too big
  Created: Date,
  Edited: Date,
  Deleted: Date,
  Edits: Number,
});

module.exports = model("messages", messages);

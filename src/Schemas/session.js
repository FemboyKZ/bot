const mongoose = require("mongoose");

const session = new mongoose.Schema({
  sessionId: { type: String, required: true },
  data: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Session", session);

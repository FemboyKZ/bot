const mongoose = require("mongoose");

const sessions = new mongoose.Schema({
  sessionId: { type: String, required: true },
  data: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("sessions", sessions);

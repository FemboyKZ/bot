const { model, Schema } = require("mongoose");

let sessions = new Schema({
  sessionId: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 86400000) },
});

sessions.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model("sessions", sessions);

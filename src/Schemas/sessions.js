const { model, Schema } = require("mongoose");

let sessions = new Schema({
  sessionId: { type: String, required: true },
  data: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = model("sessions", sessions);

import { model, Schema } from "mongoose";

let auditSchema = new Schema({
  Guild: String,
  Channel: String,
});

module.exports = model("Audit_log", auditSchema);

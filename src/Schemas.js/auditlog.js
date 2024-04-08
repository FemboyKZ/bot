const { model, Schema } = require("mongoose");
 
let auditSchema = new Schema({
    Guild: String,
    Channel: String,
});
 
module.exports = model("Audit_log", auditSchema);
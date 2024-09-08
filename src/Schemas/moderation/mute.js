const { model, Schema } = require("mongoose");

let muteSchema = new Schema({
  Guild: String,
  User: String,
  Duration: String,
  Reason: String,
  Executor: String,
});

module.exports = model("muteSchema", muteSchema);

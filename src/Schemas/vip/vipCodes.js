const { model, Schema } = require("mongoose");

let vipCodes = new Schema({
  Guild: { type: String, required: true },
  VipCodes: { type: [String] },
  VipPlusCodes: { type: [String] },
  ContributorCodes: { type: [String] },
  UsedCodes: { type: [String] },
});

module.exports = model("vipCodes", vipCodes);

const { model, Schema } = require("mongoose");

let automodRules = new Schema({
  Guild: { type: String, required: true },
  Rule: { type: String, unique: true, required: true }, // ID
  User: { type: String, default: null }, // creator
  Name: { type: String, default: null },
  Created: { type: Date, default: Date.now },
  Enabled: { type: Boolean, default: null },
  Triggers: {
    type: [
      {
        Type: { type: String, required: true }, // KEYWORD, MENTION_SPAM, etc.
        Keywords: { type: [String], default: [] }, // For KEYWORD triggers
        MentionLimit: { type: Number, default: null }, // For MENTION_SPAM triggers
        RegexPatterns: { type: [String], default: [] }, // For KEYWORD_PRESET triggers
        Presets: { type: [String], default: [] }, // For KEYWORD_PRESET triggers
      },
    ],
    default: [],
  },
  Actions: {
    type: [
      {
        Type: { type: String, required: true }, // BLOCK_MESSAGE, SEND_ALERT_MESSAGE, etc.
        Metadata: { type: Schema.Types.Mixed, default: {} },
      },
    ],
    default: [],
  },
});

module.exports = model("automodRules", automodRules);

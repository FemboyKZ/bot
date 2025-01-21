const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../Schemas/base-system.js");
const logs = require("../../Schemas/logger/automod.js");
const settings = require("../../Schemas/logger/settings.js");

module.exports = {
  name: Events.AutoModerationActionExecution,
  async execute(autoModerationActionExecution, client) {
    // TODO: Implement
  },
};

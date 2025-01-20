const { EmbedBuilder, Events, DMChannel } = require("discord.js");
const schema = require("../../Schemas/base-system.js");
const logs = require("../../Schemas/logger/channels.js");
const settings = require("../../Schemas/logger/settings.js");

module.exports = {
  name: Events.ChannelPinsUpdate,
  async execute(channel, client) {
    // TODO: implement logger
  },
};

const { Events } = require("discord.js");

module.exports = {
  name: Events.GuildUnavailable,
  async execute(guild, _client) {
    console.warn(
      `Guild unavailable (outage?): ${guild?.name ?? "unknown"} (${guild?.id})`,
    );
  },
};

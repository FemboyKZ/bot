const { Events } = require("discord.js");

module.exports = {
  name: Events.ThreadListSync,
  async execute(threads, guild, _client) {
    console.log(
      `[thread list sync] ${threads?.size ?? 0} threads synced for ${guild?.name} (${guild?.id})`,
    );
  },
};

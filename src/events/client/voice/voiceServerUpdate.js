const { Events } = require("discord.js");

module.exports = {
  name: Events.VoiceServerUpdate,
  async execute(data, _client) {
    console.log(
      `[voice server update] guild ${data?.guild?.id ?? data?.guildId} endpoint ${data?.endpoint}`,
    );
  },
};

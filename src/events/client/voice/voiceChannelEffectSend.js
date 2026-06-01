const { Events } = require("discord.js");

module.exports = {
  name: Events.VoiceChannelEffectSend,
  async execute(effect, _client) {
    console.log(
      `[voice effect] from ${effect?.userId} in channel ${effect?.channelId} (guild ${effect?.guild?.id})`,
    );
  },
};

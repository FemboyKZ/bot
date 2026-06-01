const { Events } = require("discord.js");

module.exports = {
  name: Events.ShardReady,
  async execute(shardId, unavailableGuilds, _client) {
    console.log(
      `[shard ${shardId}] ready${
        unavailableGuilds
          ? ` (${unavailableGuilds.size} guilds unavailable)`
          : ""
      }`,
    );
  },
};

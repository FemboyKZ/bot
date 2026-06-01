const { Events } = require("discord.js");

module.exports = {
  name: Events.ShardError,
  async execute(error, shardId, _client) {
    console.error(`[shard ${shardId}] connection error:`, error);
  },
};

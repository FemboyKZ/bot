const { Events } = require("discord.js");

module.exports = {
  name: Events.ShardReconnecting,
  async execute(shardId, _client) {
    console.log(`[shard ${shardId}] reconnecting...`);
  },
};

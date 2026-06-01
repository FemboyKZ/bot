const { Events } = require("discord.js");

module.exports = {
  name: Events.ShardResume,
  async execute(shardId, replayedEvents, _client) {
    console.log(
      `[shard ${shardId}] resumed (${replayedEvents} events replayed)`,
    );
  },
};

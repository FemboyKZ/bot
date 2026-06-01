const { Events } = require("discord.js");

module.exports = {
  name: Events.ShardDisconnect,
  async execute(closeEvent, shardId, _client) {
    console.warn(
      `[shard ${shardId}] disconnected (code ${closeEvent?.code ?? "?"})${
        closeEvent?.reason ? `: ${closeEvent.reason}` : ""
      }`,
    );
  },
};

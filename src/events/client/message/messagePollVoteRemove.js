const { Events } = require("discord.js");

module.exports = {
  name: Events.MessagePollVoteRemove,
  async execute(pollAnswer, userId, _client) {
    console.log(
      `[poll vote -] user ${userId} -> answer ${pollAnswer?.id} on message ${pollAnswer?.poll?.message?.id}`,
    );
  },
};

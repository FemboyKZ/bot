const { Events } = require("discord.js");

module.exports = {
  name: Events.ThreadMemberUpdate,
  async execute(_oldMember, newMember, _client) {
    console.log(
      `[thread member update] ${newMember?.id} in thread ${newMember?.thread?.id ?? newMember?.threadId}`,
    );
  },
};

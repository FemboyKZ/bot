const { Events } = require("discord.js");

module.exports = {
  name: Events.ThreadMembersUpdate,
  async execute(addedMembers, removedMembers, thread, _client) {
    console.log(
      `[thread members update] ${thread?.name} (${thread?.id}): +${addedMembers?.size ?? 0} / -${removedMembers?.size ?? 0}`,
    );
  },
};

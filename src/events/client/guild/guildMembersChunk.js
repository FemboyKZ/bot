const { Events } = require("discord.js");

module.exports = {
  name: Events.GuildMembersChunk,
  async execute(members, guild, data, _client) {
    console.log(
      `[members chunk] ${members.size} members for ${guild?.name} (${guild?.id})` +
        (data ? ` - chunk ${data.index + 1}/${data.count}` : ""),
    );
  },
};

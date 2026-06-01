const { Events } = require("discord.js");

module.exports = {
  name: Events.GuildMemberAvailable,
  async execute(member, _client) {
    console.log(
      `Member became available: ${member?.user?.tag ?? member?.id} in ${member?.guild?.name}`,
    );
  },
};

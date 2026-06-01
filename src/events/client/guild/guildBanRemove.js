const { Events } = require("discord.js");
const logs = require("../../../schemas/events/bans.js");

module.exports = {
  name: Events.GuildBanRemove,
  async execute(ban, _client) {
    // Visible audit logging is handled by guildAuditLogEntryCreate.
    // This handler only clears the ban DB record.
    try {
      await logs.deleteMany({ Guild: ban.guild.id, User: ban.user.id });
    } catch (error) {
      console.error("Error in GuildBanRemove event:", error);
    }
  },
};

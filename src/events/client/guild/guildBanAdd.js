const { Events } = require("discord.js");
const logs = require("../../../schemas/events/bans.js");

module.exports = {
  name: Events.GuildBanAdd,
  async execute(ban, _client) {
    // Visible audit logging is handled by guildAuditLogEntryCreate.
    // This handler only keeps the ban DB record.
    try {
      const logData = await logs.findOne({
        Guild: ban.guild.id,
        User: ban.user.id,
      });

      if (!logData) {
        await logs.create({
          Guild: ban.guild.id,
          User: ban.user.id,
          Reason: ban.reason,
          Created: new Date(),
        });
      }
    } catch (error) {
      console.error("Error in GuildBanAdd event:", error);
    }
  },
};

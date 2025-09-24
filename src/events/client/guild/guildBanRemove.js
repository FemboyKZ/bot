const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/baseSystem.js");
const logs = require("../../../schemas/events/bans.js");

module.exports = {
  name: Events.GuildBanRemove,
  async execute(ban, client) {
    const auditlogData = await schema.findOne({
      Guild: ban.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: ban.guild.id,
      User: ban.user.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ" })
      .setTitle("Ban Removed")
      .addFields(
        {
          name: "Banned Member",
          value: `<@${ban.user.id}>`,
          inline: false,
        },
        {
          name: "Ban Reason",
          value: `${ban.reason}` || "none",
          inline: false,
        },
        {
          name: "Ban Created",
          value: logData.Created || "unknown",
          inline: false,
        },
      );

    try {
      if (logData) {
        await logs.deleteMany({ Guild: ban.guild.id, User: ban.user.id });
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in GuildBanRemove event:", error);
    }
  },
};

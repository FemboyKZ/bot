const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/baseSystem.js");
const logs = require("../../../schemas/events/bans.js");

module.exports = {
  name: Events.GuildBanAdd,
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

    const date = new Date();

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ` })
      .setTitle("Ban Added")
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
      );
    try {
      if (!logData) {
        await logs.create({
          Guild: ban.guild.id,
          User: ban.user.id,
          Reason: ban.reason,
          Created: date,
        });
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in GuildBanAdd event:", error);
    }
  },
};

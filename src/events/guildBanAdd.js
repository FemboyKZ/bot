const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/bans.js");
const settings = require("../Schemas/logger/settings.js");

module.exports = {
  name: Events.GuildBanAdd,
  async execute(ban, client) {
    const settingsData = await settings.findOne({
      Guild: ban.guild.id,
    });
    if (settingsData.Bans === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

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
          value: `<@${ban.user.id}>` || "unknown",
          inline: false,
        },
        {
          name: "Ban Reason",
          value: `${ban.reason}` || "none",
          inline: false,
        }
      );
    try {
      if (!logData && settingsData.Store === true) {
        await logs.create({
          Guild: ban.guild.id,
          User: ban.user.id,
          Reason: ban.reason,
          Created: date,
        });
      }

      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error in GuildBanAdd event:", error);
    }
  },
};

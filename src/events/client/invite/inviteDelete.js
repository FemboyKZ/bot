const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/invites.js");

module.exports = {
  name: Events.InviteDelete,
  async execute(invite, client) {
    const auditlogData = await schema.findOne({
      Guild: invite.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: invite.guild.id,
      Invite: invite.code,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ` })
      .setTitle("Invite Deleted")
      .addFields({
        name: "Invite",
        value: `${invite.url}`,
        inline: false,
      });

    try {
      await invite.guild.invites.fetch();
      const member = await invite.guild.members.cache.get(invite.inviter);
      if (member) {
        embed.addFields({
          name: "Creator",
          value: `${member}` || `unknown`,
          inline: false,
        });
      } else if (logData && logData.User) {
        embed.addFields({
          name: "Creator",
          value: `<@${logData?.User}>`,
          inline: false,
        });
      } else {
        embed.addFields({
          name: "Creator",
          value: `<@${invite.inviter}>`,
          inline: false,
        });
      }

      if (invite.maxAge === 0) {
        embed.addFields({
          name: "Duration",
          value: "Permanent / Unknown",
          inline: false,
        });
      } else {
        embed.addFields({
          name: "Duration",
          value: `${invite.maxAge ? logData?.Expires : "Unknown"}`,
          inline: false,
        });
      }

      if (invite.maxUses === 0) {
        embed.addFields({
          name: "Max Uses",
          value: "Infinite / Unknown",
          inline: false,
        });
      } else {
        embed.addFields({
          name: "Max Uses",
          value: `${invite.maxUses ? logData?.MaxUses : "Unknown"}`,
          inline: false,
        });
      }

      try {
        if (logData) {
          await logs.deleteMany({
            Guild: invite.guild.id,
            Invite: invite.code,
          });
        }

        await channel.send({ embeds: [embed] });
      } catch (error) {
        console.error("Error in InviteDelete event:", error);
      }
    } catch (error) {
      console.error("Error in InviteDelete event:", error);
    }
  },
};

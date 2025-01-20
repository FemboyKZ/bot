const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../Schemas/base-system.js");
const logs = require("../../Schemas/logger/invites.js");
const settings = require("../../Schemas/logger/settings.js");

module.exports = {
  name: Events.InviteCreate,
  async execute(invite, client) {
    const settingsData = await settings.findOne({
      Guild: invite.guild.id,
    });
    if (settingsData.Invites === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

    const auditlogData = await schema.findOne({
      Guild: invite.guild?.id,
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
      .setTitle("Invite Created")
      .addFields({
        name: "Invite",
        value: `${invite.url}`,
        inline: false,
      });

    try {
      //const fullInvite = await invite.guild.invites.fetch();
      const member = await invite.guild.members.cache.get(invite.inviter.id);
      if (member) {
        embed.addFields({
          name: "Creator",
          value: `${member}` || `unknown`,
          inline: false,
        });
      } else if (logData && logData.User) {
        embed.addFields({
          name: "Creator",
          value: `<@${logData?.User}>` || `unknown`,
          inline: false,
        });
      } else {
        embed.addFields({
          name: "Creator",
          value: `<@${invite.inviter.id}>` || `unknown`,
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
        if (!logData && settingsData.Store === true) {
          if (invite.maxUses === 0) {
            await logs.create({
              Guild: invite.guild.id,
              Invite: invite.code,
              User: invite.inviter.id,
              Uses: invite.uses,
              MaxUses: invite.maxUses,
              Permanent: true,
              Expires: invite.maxAge,
              Created: invite.createdAt,
            });
          } else {
            await logs.create({
              Guild: invite.guild.id,
              Invite: invite.code,
              User: invite.inviter.id,
              Uses: invite.uses,
              MaxUses: invite.maxUses,
              Permanent: false,
              Expires: invite.maxAge,
              Created: invite.createdAt,
            });
          }
        }

        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      } catch (error) {
        console.error("Error in InviteCreate event:", error);
      }
    } catch (error) {
      console.error("Error in InviteCreate event:", error);
    }
  },
};

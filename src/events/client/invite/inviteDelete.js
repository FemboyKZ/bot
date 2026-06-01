const { Collection, EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const logs = require("../../../schemas/events/invites.js");

module.exports = {
  name: Events.InviteDelete,
  async execute(invite, client) {
    const channel = await getAuditChannel(invite.guild, client);
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
      // Refreshing the cached invite list needs ManageGuild;
      // isolate it so a missing perm doesn't abort the whole log below.
      try {
        const invites = await invite.guild.invites.fetch();
        if (client.invites?.has(invite.guild.id)) {
          client.invites.set(
            invite.guild.id,
            new Collection(invites.map((i) => [i.code, i.uses])),
          );
        }
      } catch (fetchError) {
        console.error("InviteDelete: failed to refresh invites:", fetchError);
      }
      const member = invite.inviter
        ? invite.guild.members.cache.get(invite.inviter.id)
        : null;
      if (member) {
        embed.addFields({
          name: "Creator",
          value: `${member}`,
          inline: false,
        });
      } else if (logData && logData.User) {
        embed.addFields({
          name: "Creator",
          value: `<@${logData.User}>`,
          inline: false,
        });
      } else if (invite.inviter) {
        embed.addFields({
          name: "Creator",
          value: `<@${invite.inviter.id}>`,
          inline: false,
        });
      } else {
        embed.addFields({
          name: "Creator",
          value: "Unknown",
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

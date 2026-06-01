const { Collection, EmbedBuilder, Events } = require("discord.js");
require("dotenv").config();
const autoroles = require("../../../schemas/autoRoles.js");
const mutes = require("../../../schemas/moderation/mutes.js");
const muteRoles = require("../../../schemas/moderation/muteRoles.js");
const schema = require("../../../schemas/baseSystem.js");
const logs = require("../../../schemas/events/members.js");

const UNKNOWN_AVATAR =
  "https://files.femboykz.com/web/images/avatars/unknown.png?raw=1";

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    if (!member || !client) {
      return;
    }

    // Auto roles
    const autoroleData = await autoroles.findOne({ Guild: member.guild.id });
    if (autoroleData && autoroleData.Roles.length) {
      for (const roleId of autoroleData.Roles) {
        const role = member.guild.roles.cache.get(roleId);
        if (!role) continue;
        try {
          await member.roles.add(role);
        } catch (e) {
          console.error(`Failed to add autorole ${roleId}:`, e);
        }
      }
    }

    // Re-apply mute role on rejoin.
    const muteData = await mutes.findOne({
      Guild: member.guild.id,
      User: member.user.id,
    });
    if (muteData) {
      const muteRole = await muteRoles.findOne({ Guild: member.guild.id });
      const role = muteRole && member.guild.roles.cache.get(muteRole.Role);
      if (role) {
        try {
          await member.roles.add(role);
        } catch (e) {
          console.error("Failed to re-apply mute role:", e);
        }
      }
    }

    const auditlogData = await schema.findOne({
      Guild: member.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: member.guild.id,
      User: member.user.id,
    });

    // Invite tracking
    let invite = null;
    try {
      const newInvites = await member.guild.invites.fetch();
      const oldInvites =
        client.invites?.get(member.guild.id) || new Collection();

      invite = newInvites.find((i) => i.uses > (oldInvites.get(i.code) ?? 0));

      if (client.invites) {
        client.invites.set(
          member.guild.id,
          new Collection(newInvites.map((i) => [i.code, i.uses])),
        );
      }
    } catch (e) {
      console.error("Failed to fetch invites (missing ManageGuild?):", e);
    }

    const date = new Date();

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle(`${member.user.username} Has Joined the Server!`)
      .setFooter({ text: `FKZ • ID: ${member.user.id}` })
      .setAuthor({
        name: "Member Joined",
        iconURL: member.user.avatarURL({ size: 256 }) || UNKNOWN_AVATAR,
      })
      .addFields({
        name: "User",
        value: `<@${member.user.id}> - \`${member.user.username}\``,
        inline: true,
      });

    try {
      if (!logData) {
        await logs.create({
          Guild: member.guild.id,
          User: member.user.id,
          Name: member.user.username,
          Nickname: member.nickname || member.user.username,
          Displayname: member.displayName,
          Avatar: member.user.displayAvatarURL({ size: 128 }),
          Banner: member.user.bannerURL({ size: 128 }) || null,
          Roles: member.roles.cache.map((role) => role.id) || [],
          Joined: member.joinedAt || date,
          Created: member.user.createdAt,
        });
      } else {
        // Returning member
        await logs.updateOne(
          { Guild: member.guild.id, User: member.user.id },
          {
            Name: member.user.username,
            Nickname: member.nickname || member.user.username,
            Displayname: member.displayName,
            Avatar: member.user.displayAvatarURL({ size: 128 }),
            Banner: member.user.bannerURL({ size: 128 }) || null,
            Joined: member.joinedAt || date,
            Left: false,
            LeftAt: null,
          },
        );
      }

      if (invite && invite.inviter) {
        const inviter = await client.users.fetch(invite.inviter.id);
        embed.addFields(
          {
            name: "Inviter",
            value: `${inviter}`,
            inline: false,
          },
          {
            name: "Invite",
            value: `<https://discord.gg/${invite.code}>`,
            inline: false,
          },
        );
      } else {
        embed.addFields(
          {
            name: "Inviter",
            value: "None",
            inline: false,
          },
          {
            name: "Invite",
            value: "Unknown / Vanity",
            inline: false,
          },
        );
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in guildMemberAdd event:", error);
    }
  },
};

const { EmbedBuilder, Events } = require("discord.js");
require("dotenv").config();
const autoroles = require("../../../schemas/autoRoles.js");
const mutes = require("../../../schemas/moderation/mutes.js");
const muteRoles = require("../../../schemas/moderation/muteRoles.js");
const schema = require("../../../schemas/baseSystem.js");
const logs = require("../../../schemas/events/members.js");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    if (!member || !client) {
      return;
    }

    const autoroleData = await autoroles.findOne({ Guild: member.guild.id });
    if (autoroleData) {
      if (!autoroleData.Roles.length) return;
      try {
        for (const roleId of autoroleData.Roles) {
          const role = await member.guild.roles.cache.get(roleId);
          if (role) {
            await member.roles.add(role);
          }
        }
      } catch (e) {
        return console.log(e);
      }
    }

    const muteData = await mutes.findOne({
      Guild: member.guild.id,
      User: member.user.id,
    });
    const muteRole = await muteRoles.findOne({
      Guild: member.guild.id,
    });
    if (muteData) {
      if (!muteRole) return;
      try {
        const role = await member.guild.roles.cache.get(muteRole.Role);
        if (role) {
          await member.roles.add(role);
        }
      } catch (e) {
        return console.log(e);
      }
    }

    const auditlogData = await schema.findOne({
      Guild: member.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: member.guild.id,
      User: member.user.id,
    });

    const newInvites = await member.guild.invites.fetch();
    const oldInvites = (await client.invites.get(member.guild.id)) || new Map();

    const invite = await newInvites.find(
      (i) => i.uses > oldInvites.get(i.code),
    );

    const date = new Date();

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle(`${member.user.username} Has Joined the Server!`)
      .setFooter({ text: `FKZ • ID: ${member.user.id}` })
      .addFields({
        name: "User",
        value: `<@${member.user.id}> - \`${member.user.username}\``,
        inline: true,
      });

    if (logData && logData.Avatar) {
      embed.setAuthor({
        name: `Member Joined`,
        iconURL: member.user.avatarURL({ size: 256 })
          ? logData.Avatar
          : "https://files.femboy.kz/web/images/avatars/unknown.png",
      });
    } else {
      embed.setAuthor({
        name: `Member Joined`,
        iconURL:
          member.user.avatarURL({ size: 256 }) ||
          "https://files.femboy.kz/web/images/avatars/unknown.png",
      });
    }

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
      }

      if (!invite) {
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
        await channel.send({ embeds: [embed] });
      } else {
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
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error in guildMemberAdd event:", error);
    }
  },
};

const { EmbedBuilder, Events } = require("discord.js");
require("dotenv").config();
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/members.js");
const settings = require("../../../schemas/events/settings.js");

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember, client) {
    const settingsData = await settings.findOne({
      Guild: newMember.guild.id,
    });
    if (settingsData.Members === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

    const auditlogData = await schema.findOne({
      //Guild: oldMember.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      //Guild: oldMember.guild.id,
      User: oldMember.user.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ • ID: ${newMember.user.id}` })
      .setTitle("Member Updated")
      .addFields({
        name: "User",
        value: `<@${newMember.user.id}> - \`${newMember.user.username}\``,
        inline: false,
      });

    if (logData && logData.Avatar) {
      embed.setAuthor({
        name: `${newMember.user.username} has updated their profile`,
        iconURL: newMember.user.avatarURL({ size: 256 })
          ? logData.Avatar
          : "https://files.femboy.kz/web/images/avatars/unknown.png",
      });
    } else {
      embed.setAuthor({
        name: `${newMember.user.username} has updated their profile`,
        iconURL:
          newMember.user.avatarURL({ size: 256 }) ||
          "https://files.femboy.kz/web/images/avatars/unknown.png",
      });
    }

    const roleEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ • ID: ${newMember.user.id}` })
      .setTitle("Member Updated");

    try {
      if (oldMember.roles.cache.size > newMember.roles.cache.size) {
        oldMember.roles.cache.forEach((role) => {
          if (!newMember.roles.cache.has(role.id)) {
            roleEmbed.addFields(
              {
                name: "Role Removed",
                value: `${role}`,
                inline: false,
              },
              {
                name: "User",
                value: `<@${newMember.user.id}> - \`${newMember.user.username}\``,
                inline: false,
              }
            );
            channel.send({ embeds: [roleEmbed] });
          }
        });
      }
      if (oldMember.roles.cache.size < newMember.roles.cache.size) {
        newMember.roles.cache.forEach((role) => {
          if (!oldMember.roles.cache.has(role.id)) {
            roleEmbed.addFields(
              {
                name: "Role Added",
                value: `${role}`,
                inline: false,
              },
              {
                name: "User",
                value: `<@${newMember.user.id}> - \`${newMember.user.username}\``,
                inline: false,
              }
            );
            channel.send({ embeds: [roleEmbed] });
          }
        });
      }
    } catch (err) {
      console.error("Error in MemberUpdate event:", err);
    }

    try {
      if (!logData && settingsData.Store === true) {
        await logs.create({
          Guild: newMember.guild.id,
          User: newMember.user.id,
          Name: newMember.user.username,
          Nickname: newMember.nickname,
          Displayname: newMember.displayName,
          Avatar: newMember.user.displayAvatarURL({ size: 128 }),
          Banner: newMember.user.bannerURL({ size: 128 }),
          Roles: newMember.roles.cache.map((role) => role.id),
          Joined: newMember.joinedAt,
          Created: newMember.user.createdAt,
        });
      }

      if (oldMember.nickname !== newMember.nickname) {
        embed.addFields({
          name: `Nickname`,
          value: `\`${oldMember.nickname || "none"}\`  →  \`${
            newMember.nickname || "none"
          }\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: newMember.guild.id, User: newMember.user.id },
            {
              Nickname: newMember.nickname,
            }
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldMember.displayName !== newMember.displayName) {
        embed.addFields({
          name: `Displayname`,
          value: `\`${oldMember.displayName || "none"}\`  →  \`${
            newMember.displayName || "none"
          }\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: newMember.guild.id, User: newMember.user.id },
            {
              Displayname: newMember.displayName,
            }
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldMember.user.username !== newMember.user.username) {
        embed.addFields({
          name: `Username`,
          value: `\`${oldMember.user.username || "none"}\`  →  \`${
            newMember.user.username || "none"
          }\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: newMember.guild.id, User: newMember.user.id },
            {
              Name: newMember.user.username,
            }
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      /*
          if (oldMember.avatar !== newMember.avatar) {
            embed
              .setImage(
                `${
                  newMember.avatarURL({ size: 128 })
                    ? logData.Avatar
                    : oldMember.avatarURL({ size: 128 })
                }`
              )
              .addFields({
                name: `Profile Picture`,
                value: `[Old Pfp](<${
                  oldMember.avatarURL({
                    size: 128,
                  })
                    ? logData.Avatar
                    : oldMember.avatarURL({ size: 128 })
                }>)  →  [New Pfp](<${newMember.avatarURL({ size: 128 })}>)`,
                inline: false,
              });
            if (logData && settingsData.Store === true) {
              await logs.findOneAndUpdate(
                { Guild: newMember.guild.id, User: newMember.user.id },
                {
                  Avatar: newMember.avatarURL({ size: 128 }),
                }
              );
            }
            if (settingsData.Post === true) {
              await channel.send({ embeds: [embed] });
            }
          }
          */

      if (oldMember.user.avatar !== newMember.user.avatar) {
        embed
          .setImage(
            `${
              newMember.user.avatarURL({ size: 128 })
                ? logData.Avatar
                : oldMember.user.avatarURL({ size: 128 })
            }`
          )
          .addFields({
            name: `Profile Picture`,
            value: `[Old Pfp](<${
              oldMember.user.avatarURL({
                size: 128,
              })
                ? logData.Avatar
                : oldMember.user.avatarURL({ size: 128 })
            }>)  →  [New Pfp](<${newMember.user.avatarURL({ size: 128 })}>)`,
            inline: false,
          });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: newMember.guild.id, User: newMember.user.id },
            {
              Avatar: newMember.user.avatarURL({ size: 128 }),
            }
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldMember.user.banner !== newMember.user.banner) {
        embed
          .setImage(
            `${
              newMember.user.bannerURL({ size: 128 })
                ? logData.Banner
                : oldMember.user.bannerURL({ size: 128 })
            }`
          )
          .addFields({
            name: `Banner Image`,
            value: `[Old Banner](<${
              oldMember.user.bannerURL({
                size: 128,
              })
                ? logData.Banner
                : oldMember.user.bannerURL({ size: 128 })
            }>)  →  [New Banner](<${newMember.user.bannerURL({
              size: 128,
            })}>)`,
            inline: false,
          });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: newMember.guild.id, User: newMember.user.id },
            {
              Banner: newMember.user.bannerURL({ size: 128 }),
            }
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: newMember.guild.id, User: newMember.user.id },
            {
              Roles: newMember.roles.cache.map((role) => role.id),
            }
          );
        }
      }
    } catch (error) {
      console.error("Error in MemberUpdate event:", error);
    }
  },
};

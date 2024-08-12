const {
  EmbedBuilder,
  PermissionFlagsBits,
  Collection,
  Events,
} = require("discord.js");
require("dotenv").config();
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/members.js");
const inviteLogs = require("../Schemas/logger/invites.js");
const settings = require("../Schemas/logger/settings.js");
const { client } = require("../index.js");

const invites = new Collection();
const wait = require("timers/promises").setTimeout;

client.on("ready", async () => {
  await wait(2000);

  client.guilds.cache.forEach(async (guild) => {
    const clientMember = guild.members.cache.get(client.user.id);

    if (!clientMember.permissions.has(PermissionFlagsBits.ManageGuild)) return;

    const firstInvites = await guild.invites.fetch().catch((err) => {
      console.log(err);
    });

    invites.set(
      guild.id,
      new Collection(firstInvites.map((invite) => [invite.code, invite.uses]))
    );
  });

  // guild is commented cuz it can be null and it will throw an error, so it will only work on fkz rn.

  client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const settingsData = await settings.findOne({
      Guild: newMember.guild.id,
    });
    if (settingsData.Members === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

    const data = await schema.findOne({
      //Guild: oldMember.guild.id,
      ID: "audit-logs",
    });
    if (!data || !data.Channel) return;
    const channel = client.channels.cache.get(data.Channel);
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
        value: `<@${newMember.user.id}> - ${newMember.user.username}`,
        inline: false,
      });

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
        if (logData && logData.Avatar) {
          embed.setImage(
            newMember.user.avatarURL({ size: 256 })
              ? logData?.Avatar
              : "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
        } else {
          embed.setImage(
            newMember.user.avatarURL({ size: 256 }) ||
              "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
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
        if (logData && logData.Avatar) {
          embed.setImage(
            newMember.user.avatarURL({ size: 256 })
              ? logData?.Avatar
              : "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
        } else {
          embed.setImage(
            newMember.user.avatarURL({ size: 256 }) ||
              "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
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
        if (logData && logData.Avatar) {
          embed.setImage(
            newMember.user.avatarURL({ size: 256 })
              ? logData?.Avatar
              : "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
        } else {
          embed.setImage(
            newMember.user.avatarURL({ size: 256 }) ||
              "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
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
        if (logData && logData.Avatar) {
          embed.setImage(
            newMember.user.avatarURL({ size: 256 })
              ? logData?.Avatar
              : "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
        } else {
          embed.setImage(
            newMember.user.avatarURL({ size: 256 }) ||
              "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
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
        if (logData && logData.Avatar) {
          embed.setImage(
            newMember.user.avatarURL({ size: 256 })
              ? logData?.Avatar
              : "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
        } else {
          embed.setImage(
            newMember.user.avatarURL({ size: 256 }) ||
              "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
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
        if (logData && logData.Avatar) {
          embed.setImage(
            newMember.user.avatarURL({ size: 256 })
              ? logData?.Avatar
              : "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
        } else {
          embed.setImage(
            newMember.user.avatarURL({ size: 256 }) ||
              "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
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
  });
});

client.on(Events.GuildMemberAdd, async (member) => {
  const settingsData = await settings.findOne({
    Guild: member.guild.id,
  });
  if (settingsData.Members === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: member.guild.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
  if (!channel) return;

  const logData = await logs.findOne({
    Guild: member.guild.id,
    User: member.user.id,
  });

  const newInvites = await member.guild.invites.fetch();
  const oldInvites = invites.get(member.guild.id) || new Map();

  const invite = newInvites.find((i) => i.uses > oldInvites.get(i.code));

  const inviteData = await inviteLogs.findOne({
    Guild: member.guild.id,
    Invite: invite.code,
  });

  const date = new Date();

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setTitle(`${member.user.username} Has Joined the Server!`)
    .setAuthor({ name: `Member Joined` })
    .setImage(
      member.user.avatarURL({ size: 256 })
        ? logData.Avatar
        : "https://files.femboy.kz/web/images/avatars/unknown.png"
    )
    .setFooter({ text: `FKZ • ID: ${member.user.id}` });

  try {
    if (inviteData && settingsData.Store === true) {
      await inviteLogs.findOneAndUpdate(
        { Guild: member.guild.id, Invite: invite.code },
        {
          Uses: invite.uses,
        }
      );
    }
    if (!logData && settingsData.Store === true) {
      await logs.create({
        Guild: member.guild.id,
        User: member.user.id,
        Name: member.user.username,
        Nickname: member.nickname || member.user.username,
        Displayname: member.displayName,
        Avatar: member.user.displayAvatarURL({ size: 128 }),
        Banner: member.user.bannerURL({ size: 128 }),
        Roles: member.roles.cache.map((role) => role.id) || [],
        Joined: member.joinedAt || date,
        Created: member.user.createdAt,
      });
    }

    if (settingsData.Post === true) {
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
          }
        );
        if (logData && logData.Avatar) {
          embed.setImage(
            member.user.avatarURL({ size: 256 })
              ? logData?.Avatar
              : "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          await channel.send({ embeds: [embed] });
        } else {
          embed.setImage(
            member.user.avatarURL({ size: 256 }) ||
              "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          await channel.send({ embeds: [embed] });
        }
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
          }
        );
        if (logData && logData.Avatar) {
          embed.setImage(
            member.user.avatarURL({ size: 256 })
              ? logData?.Avatar
              : "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          await channel.send({ embeds: [embed] });
        } else {
          embed.setImage(
            member.user.avatarURL({ size: 256 }) ||
              "https://files.femboy.kz/web/images/avatars/unknown.png"
          );
          await channel.send({ embeds: [embed] });
        }
      }
    }
  } catch (error) {
    console.error("Error in MemberAdd event:", error);
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  const settingsData = await settings.findOne({
    Guild: member.guild.id,
  });
  if (settingsData.Members === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: member.guild.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
  if (!channel) return;

  const logData = await logs.findOne({
    Guild: member.guild.id,
    User: member.user.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setAuthor({ name: `Member Left` })
    .setFooter({ text: `FKZ • ID: ${member.user.id}` })
    .setTitle(`${member.user.username} has left the server`)
    .setDescription(`<@${member.user.id}> has left the Server`)
    .setImage(
      member.user.avatarURL({ size: 256 })
        ? logData.Avatar
        : "https://files.femboy.kz/web/images/avatars/unknown.png"
    );

  try {
    if (logData && settingsData.Store === true) {
      await logs.deleteMany({
        Guild: member.guild.id,
        User: member.user.id,
      });
    }
    if (settingsData.Post === true) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error(`Error in MemberRemove event:`, error);
  }
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const settingsData = await settings.findOne({
    Guild: newMember.guild.id,
  });
  if (settingsData.Members === false) return;
  if (settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: newMember.guild.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
  if (!channel) return;

  if (oldMember.partial) await oldMember.fetch();

  const logData = await logs.findOne({
    Guild: newMember.guild.id,
    User: newMember.user.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ • ID: ${newMember.user.id}` })
    .setTitle("Member Updated")
    .setImage(
      newMember.user.avatarURL({ size: 256 })
        ? logData.Avatar
        : "https://files.femboy.kz/web/images/avatars/unknown.png"
    );

  try {
    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
      oldMember.roles.cache.forEach((role) => {
        if (!newMember.roles.cache.has(role.id)) {
          embed.addFields(
            {
              name: "Role Removed",
              value: `${role}`,
              inline: false,
            },
            {
              name: "User",
              value: `<@${newMember.user.id}> - ${newMember.user.username}`,
              inline: false,
            }
          );
          channel.send({ embeds: [embed] });
        }
      });
    }
    if (oldMember.roles.cache.size < newMember.roles.cache.size) {
      newMember.roles.cache.forEach((role) => {
        if (!oldMember.roles.cache.has(role.id)) {
          embed.addFields(
            {
              name: "Role Added",
              value: `${role}`,
              inline: false,
            },
            {
              name: "User",
              value: `<@${newMember.user.id}> - ${newMember.user.username}`,
              inline: false,
            }
          );
          channel.send({ embeds: [embed] });
        }
      });
    }
  } catch (err) {
    console.error("Error in MemberUpdate event:", err);
  }
});

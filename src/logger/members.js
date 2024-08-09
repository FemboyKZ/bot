const {
  EmbedBuilder,
  PermissionsBitField,
  Collection,
  Events,
} = require("discord.js");
require("dotenv").config();
const schema = require("../Schemas/base-system.js");
const { client } = require("../index.js");

const invites = new Collection();
const wait = require("timers/promises").setTimeout;

client.on("ready", async () => {
  await wait(2000);

  client.guilds.cache.forEach(async (guild) => {
    const clientMember = guild.members.cache.get(client.user.id);

    if (!clientMember.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return;

    const firstInvites = await guild.invites.fetch().catch((err) => {
      console.log(err);
    });

    invites.set(
      guild.id,
      new Collection(firstInvites.map((invite) => [invite.code, invite.uses]))
    );
  });

  client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    try {
      const data = await schema.findOne({
        Guild: oldMember.guild.id,
        ID: "audit-logs",
      });

      let channel = client.channels.cache.get(data.Channel);
      if (channel === undefined) {
        let channel = client.channels.cache.get(process.env.LOGS_CHAT_ID);
        if (channel === undefined) {
          return;
        }
      }
      if (!data || !data.Channel || !channel) return;

      if (oldMember.user.system || newMember.user.system) return;
      const fullOldMember = await oldMember.fetch(); // fetch seems to return same as newMember. ?

      const embed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setFooter({ text: "FKZ Log System" })
        .setTitle("Member Updated")
        .addFields({
          name: "User:",
          value: `<@${newMember.user.id}> - ${newMember.user.username}`,
          inline: false,
        });

      if (oldMember.nickname !== newMember.nickname) {
        const embedNick = new EmbedBuilder()
          .setColor("#ff00b3")
          .setTimestamp()
          .setFooter({ text: "FKZ Log System" })
          .setTitle("Member Updated")
          .addFields(
            {
              name: "User:",
              value: `<@${newMember.user.id}> - ${newMember.user.username}`,
              inline: false,
            },
            {
              name: `Nickname Updated`,
              value: `DisplayName: \`${oldMember.nickname || "none"}\`  →  \`${
                newMember.nickname || "none"
              }\``,
              inline: false,
            }
          );
        if (oldMember.nickname === null && newMember.nickname === null) return;
        await channel.send({ embeds: [embedNick] });
      }

      if (oldMember.displayName !== newMember.displayName) {
        const embedDisplay = new EmbedBuilder()
          .setColor("#ff00b3")
          .setTimestamp()
          .setFooter({ text: "FKZ Log System" })
          .setTitle("Member Updated")
          .addFields(
            {
              name: "User:",
              value: `<@${newMember.user.id}> - ${newMember.user.username}`,
              inline: false,
            },
            {
              name: `Displayname Updated`,
              value: `DisplayName: \`${
                oldMember.displayName || "none"
              }\`  →  \`${newMember.displayName || "none"}\``,
              inline: false,
            }
          );
        await channel.send({ embeds: [embedDisplay] });
      }

      if (oldMember.user.username !== newMember.user.username) {
        embed.addFields({
          name: `Username Updated`,
          value: `Name: \`${oldMember.user.username || "none"}\`  →  \`${
            newMember.user.username || "none"
          }\``,
          inline: false,
        });
        await channel.send({ embeds: [embed] });
      }

      if (oldMember.avatar !== newMember.avatar) {
        if (oldMember.avatar === null || newMember.avatar === null) return;
        embed.setImage(`${newMember.avatarURL({ size: 128 })}`).addFields({
          name: `Profile picture updated`,
          value: `[Old Pfp](<${oldMember.avatarURL({
            size: 512,
          })}>)  →  [New Pfp](<${newMember.avatarURL({ size: 512 })}>)`,
          inline: false,
        });
        await channel.send({ embeds: [embed] });
      }

      if (oldMember.user.avatar !== newMember.user.avatar) {
        if (oldMember.user.avatar === null || newMember.user.avatar === null)
          return;
        embed.setImage(`${newMember.user.avatarURL({ size: 128 })}`).addFields({
          name: `Profile picture updated`,
          value: `[Old Pfp](<${oldMember.user.avatarURL({
            size: 512,
          })}>)  →  [New Pfp](<${newMember.user.avatarURL({ size: 512 })}>)`,
          inline: false,
        });
        await channel.send({ embeds: [embed] });
      }

      if (oldMember.user.banner !== newMember.user.banner) {
        if (oldMember.user.banner === null || newMember.user.banner === null)
          return;
        embed.setImage(`${newMember.user.bannerURL({ size: 128 })}`).addFields({
          name: `Banner updated`,
          value: `[Old Banner](<${oldMember.user.bannerURL({
            size: 512,
          })}>)  →  [New Banner](<${newMember.user.bannerURL({
            size: 512,
          })}>)`,
          inline: false,
        });
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error(error);
    }
  });
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const data = await schema.findOne({
      Guild: member.guild.id,
      ID: "audit-logs",
    });
    const channel = client.channels.cache.get(data.Channel);
    if (!data || !data.Channel || !channel) return;

    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invites.get(member.guild.id) || new Map();

    const invite = newInvites.find((i) => i.uses > oldInvites.get(i.code));

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle(`${member.user.username} Has Joined the Server!`)
      .setAuthor({ name: `Member Joined` })
      .setImage("https://femboy.kz/images/wide.png")
      .setFooter({ text: "FKZ Log System" });

    if (!invite) {
      embed.setDescription(
        `<@${member.user.id}> joined the server using an \`unknown invite\`. This could mean they used a vanity invite link if the server has one.`
      );
    } else {
      const inviter = await client.users.fetch(invite.inviter.id);
      embed.setDescription(
        `<@${member.user.id}> Joined the server using the invite: \`${invite.code}\` Which was created by: ${inviter.tag}.\nThe invite has been used \`${invite.uses}\` times since it was created.`
      );
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  try {
    const data = await schema.findOne({
      Guild: member.guild.id,
      ID: "audit-logs",
    });
    const channel = client.channels.cache.get(data.Channel);
    if (!data || !data.Channel || !channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setAuthor({ name: `Member Left` })
      .setFooter({ text: "FKZ Log System" })
      .setTitle(`${member.user.username} has left the server`)
      .setDescription(`${member} has left the Server`);

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(`Error in guildMemberRemove event:`, error);
  }
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const data = await schema.findOne({
    Guild: oldMember.guild.id,
    ID: "audit-logs",
  });

  if (!data) return;
  const logID = data.Channel;
  if (!logID) return;

  const channel = client.channels.cache.get(logID);
  if (!channel) return;

  if (oldMember.user.bot || newMember.user.bot) return;
  if (oldMember.user.system || newMember.user.system) return;
  if (oldMember.partial) {
    await oldMember.fetch().catch(() => {});
  }

  try {
    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Member Updated");

    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
      oldMember.roles.cache.forEach((role) => {
        if (!newMember.roles.cache.has(role.id)) {
          embed.addFields(
            {
              name: "Role Removed: ",
              value: `${role}`,
              inline: false,
            },
            {
              name: "User:",
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
              name: "Role Added: ",
              value: `${role}`,
              inline: false,
            },
            {
              name: "User:",
              value: `<@${newMember.user.id}> - ${newMember.user.username}`,
              inline: false,
            }
          );
          channel.send({ embeds: [embed] });
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
});

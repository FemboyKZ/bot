const {
  EmbedBuilder,
  PermissionsBitField,
  Collection,
  Events,
} = require("discord.js");
require("dotenv").config();
const Audit_Log = require("./Schemas/auditlog");
const { client } = require("./index.js");

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
      const data = await Audit_Log.findOne({
        Guild: oldMember.guild.id,
      });
      let logID;
      if (data) {
        logID = data.Channel;
      } else {
        return;
      }

      const logschatID = await client.channels.fetch(process.env.LOGS_CHAT_ID);

      if (oldMember.user.system || newMember.user.system) return;
      if (oldMember.partial) {
        await oldMember.fetch();
      }

      const auditEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setFooter({ text: "FKZ Log System" })
        .setTitle("Member Updated")
        .addFields({
          name: "User:",
          value: `<@${newMember.user.id}> - ${newMember.user.username}`,
          inline: false,
        });

      let auditChannel = client.channels.cache.get(logID);
      if (auditChannel === undefined) {
        let auditChannel = client.channels.cache.get(logschatID);
        if (auditChannel === undefined) {
          return;
        }
      }

      if (oldMember.nickname !== newMember.nickname) {
        const fullOldMember = await oldMember.fetch();
        const fullOldNickName = fullOldMember.nickname;
        auditEmbed.addFields({
          name: `Nickname Updated`,
          value: `DisplayName: \`${
            fullOldNickName || oldMember.nickname || "none"
          }\`  →  \`${newMember.nickname || "none"}\``,
          inline: false,
        });
        await auditChannel.send({ embeds: [auditEmbed] });
      }

      if (oldMember.displayName !== newMember.displayName) {
        const fullOldMember = await oldMember.fetch();
        const fullOldDisplayName = fullOldMember.displayName;
        auditEmbed.addFields({
          name: `Nickname or Displayname Updated`,
          value: `DisplayName: \`${
            fullOldDisplayName || oldMember.displayName || "none"
          }\`  →  \`${newMember.displayName || "none"}\``,
          inline: false,
        });
        await auditChannel.send({ embeds: [auditEmbed] });
      }

      if (oldMember.user.username !== newMember.user.username) {
        const fullOldMember = await oldMember.fetch();
        const fullOldUsername = fullOldMember.user.username;
        auditEmbed.addFields({
          name: `Username Updated`,
          value: `Name: \`${
            fullOldUsername || oldMember.user.username || "none"
          }\`  →  \`${newMember.user.username || "none"}\``,
          inline: false,
        });
        await auditChannel.send({ embeds: [auditEmbed] });
      }

      if (oldMember.avatar !== newMember.avatar) {
        const fullOldMember = await oldMember.fetch();
        const fullOldPfp = fullOldMember.avatarURL({ size: 512 });
        const oldPfp = oldMember.avatarURL({ size: 512 });
        const pfp = newMember.avatarURL({ size: 64 });
        auditEmbed.setImage(`${pfp}`).addFields({
          name: `Profile picture updated`,
          value: `[Old Pfp](<${
            fullOldPfp || oldPfp
          }>)  →  [New Pfp](<${newMember.avatarURL({ size: 512 })}>)`,
          inline: false,
        });
        await auditChannel.send({ embeds: [auditEmbed] });
      }

      if (oldMember.user.avatar !== newMember.user.avatar) {
        const fullOldMember = await oldMember.fetch();
        const fullOldUserPfp = fullOldMember.user.avatarURL({ size: 512 });
        const oldUserPfp = oldMember.user.avatarURL({ size: 512 });
        const UserPfp = newMember.avatarURL({ size: 64 });
        auditEmbed.setImage(`${UserPfp}`).addFields({
          name: `Profile picture updated`,
          value: `[Old Pfp](<${
            fullOldUserPfp || oldUserPfp
          }>)  →  [New Pfp](<${newMember.user.avatarURL({ size: 512 })}>)`,
          inline: false,
        });
        await auditChannel.send({ embeds: [auditEmbed] });
      }

      if (oldMember.user.banner !== newMember.user.banner) {
        const fullOldMember = await oldMember.fetch();
        const fullOldBanner = fullOldMember.user.bannerURL({ size: 512 });
        const oldBanner = oldMember.user.bannerURL({ size: 512 });
        const Banner = newMember.user.bannerURL({ size: 64 });
        auditEmbed.setImage(`${Banner}`).addFields({
          name: `Banner updated`,
          value: `[Old Banner](<${
            fullOldBanner || oldBanner
          }>)  →  [New Banner](<${newMember.user.bannerURL({ size: 512 })}>)`,
          inline: false,
        });
        await auditChannel.send({ embeds: [auditEmbed] });
      }
    } catch (error) {
      console.error(error);
    }
  });
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const data = await Audit_Log.findOne({
      Guild: member.guild.id,
    });

    if (!data) {
      return;
    }

    const logID = data.Channel;
    const auditChannel = client.channels.cache.get(logID);

    if (!auditChannel) {
      return;
    }

    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invites.get(member.guild.id) || new Map();

    const invite = newInvites.find((i) => i.uses > oldInvites.get(i.code));

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle(`${member.user.username} Has Joined the Server!`)
      .setAuthor({ name: `Member Joined` })
      .setImage("https://femboy.kz/images/wide.png")
      .setFooter({ text: "FKZ Log System" });

    if (!invite) {
      auditEmbed.setDescription(
        `<@${member.user.id}> joined the server using an \`unknown invite\`. This could mean they used a vanity invite link if the server has one.`
      );
    } else {
      const inviter = await client.users.fetch(invite.inviter.id);
      auditEmbed.setDescription(
        `<@${member.user.id}> Joined the server using the invite: \`${invite.code}\` Which was created by: ${inviter.tag}.\nThe invite has been used \`${invite.uses}\` times since it was created.`
      );
    }

    await auditChannel.send({ embeds: [auditEmbed] });
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  try {
    const data = await Audit_Log.findOne({
      Guild: member.guild.id,
    });
    if (!data) return;

    const logID = data.Channel;
    const auditChannel = client.channels.cache.get(logID);
    if (!auditChannel) return;

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setAuthor({ name: `Member Left` })
      .setFooter({ text: "FKZ Log System" })
      .setTitle(`${member.user.username} has left the server`)
      .setDescription(`${member} has left the Server`);

    await auditChannel.send({ embeds: [auditEmbed] });
  } catch (error) {
    console.error(`Error in guildMemberRemove event:`, error);
  }
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const data = await Audit_Log.findOne({
    Guild: oldMember.guild.id,
  });
  if (!data) {
    return;
  }

  const logID = data.Channel;
  const auditChannel = client.channels.cache.get(logID);

  if (!auditChannel) {
    return;
  }

  if (oldMember.user.bot || newMember.user.bot) return;
  if (oldMember.user.system || newMember.user.system) return;
  if (oldMember.partial) {
    await oldMember.fetch().catch(() => {});
  }

  try {
    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Member Updated");

    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
      oldMember.roles.cache.forEach((role) => {
        if (!newMember.roles.cache.has(role.id)) {
          auditEmbed.addFields(
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
          auditChannel.send({ embeds: [auditEmbed] });
        }
      });
    }
    if (oldMember.roles.cache.size < newMember.roles.cache.size) {
      newMember.roles.cache.forEach((role) => {
        if (!oldMember.roles.cache.has(role.id)) {
          auditEmbed.addFields(
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
          auditChannel.send({ embeds: [auditEmbed] });
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
});

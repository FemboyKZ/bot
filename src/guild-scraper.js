const automodData = require("./Schemas/logger/automod.js");
const bansData = require("./Schemas/logger/bans.js");
const channelsData = require("./Schemas/logger/channels.js");
const emojisData = require("./Schemas/logger/emojis.js");
const invitesData = require("./Schemas/logger/invites.js");
const membersData = require("./Schemas/logger/members.js");
const messagesData = require("./Schemas/logger/messages.js");
const rolesData = require("./Schemas/logger/roles.js");
const stickersData = require("./Schemas/logger/stickers.js");
const threadsData = require("./Schemas/logger/threads.js");
const usersData = require("./Schemas/logger/users.js");

const schema = require("./Schemas/base-system.js");
const { client } = require("./index.js");

const { PermissionsBitField, Events } = require("discord.js");

client.on("ready", async () => {
  const guild = await client.guilds.cache.get(`${process.env.GUILD_ID}`); // fkz
  const members = await guild.members.fetch();
  const channels = await guild.channels.fetch();
  const invites = await guild.invites.fetch();
  const bans = await guild.bans.fetch();
  const emojis = await guild.emojis.fetch();
  const stickers = await guild.stickers.fetch();
  const roles = await guild.roles.fetch();

  members.forEach(async (member) => {
    const data = await membersData.findOne({
      Guild: guild.id,
      User: member.user.id,
    });
    const roles = member.roles.cache.map((role) => role.id);

    if (data) {
      await membersData.findOneAndUpdate(
        { Guild: guild.id, User: member.user.id },
        {
          Joined: member.joinedAt,
          Name: member.user.username,
          Nickname: member.nickname,
          Avatar: member.user.avatarURL({ size: 512 }) || null,
          Banner: member.user.bannerURL({ size: 512 }) || null,
          Roles: roles || [],
        }
      );
    } else {
      await membersData.create({
        Guild: guild.id,
        User: member.user.id,
        Joined: member.joinedAt,
        Created: member.user.createdAt,
        Name: member.user.username,
        Nickname: member.nickname,
        Avatar: member.user.avatarURL({ size: 512 }) || null,
        Banner: member.user.bannerURL({ size: 512 }) || null,
        Roles: roles || [],
      });
    }
  });
});

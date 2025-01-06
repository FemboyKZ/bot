const automodData = require("./Schemas/logger/automod.js");
const bansData = require("./Schemas/logger/bans.js");
const channelsData = require("./Schemas/logger/channels.js");
const emojisData = require("./Schemas/logger/emojis.js");
const invitesData = require("./Schemas/logger/invites.js");
const membersData = require("./Schemas/logger/members.js");
// const messagesData = require("./Schemas/logger/messages.js"); // only logging deleted/edited
const rolesData = require("./Schemas/logger/roles.js");
const stickersData = require("./Schemas/logger/stickers.js");
// const threadsData = require("./Schemas/logger/threads.js"); // pointless
const settings = require("./Schemas/logger/settings.js");

const { client } = require("./index.js");
require("dotenv").config();

// Only runs on FKZ, no plans on making it work on other guilds

client.on("ready", async () => {
  const guild = client.guilds.cache.get(`${process.env.GUILD_ID}`); // fkz
  if (!guild) return;

  const settingsData = await settings.findOne({
    Guild: guild.id,
  });
  if (!settingsData) {
    console.warn(
      `No settings data found for guild ${guild.name} (${guild.id})! Setting default values (Enabled)...`
    );
    await settings.create({
      Guild: guild.id,
      Post: true,
      Store: true,
      Automod: true,
      Bans: true,
      Channels: true,
      Emojis: true,
      Invites: true,
      Members: true,
      Messages: true,
      Roles: true,
      Stickers: true,
      Threads: true,
    });
  }

  async function updateOrCreate(collection, query, updateData, createData) {
    try {
      const data = await collection.findOne(query);
      if (data) {
        await collection.findOneAndUpdate(query, updateData);
      } else {
        await collection.create(createData);
      }
    } catch (err) {
      console.error(
        `Error updating or creating document in ${collection.collection.name} collection:`,
        err
      );
    }
  }

  if (settingsData && settingsData.Store === false) return;

  const date = new Date();

  async function scrapeAutomod(guild, settingsData) {
    if (settingsData && settingsData.Automod === false) return;

    const automod = await guild.autoModerationRules.fetch();
    await Promise.all(
      automod.map(async (rule) => {
        const query = { Guild: guild.id, Rule: rule.id };
        const updateData = {
          Name: rule.name,
          Trigger: rule.triggerType,
          Action: rule.actions[0].type,
          Enabled: rule.enabled,
        };
        const createData = {
          ...updateData,
          Guild: guild.id,
          Rule: rule.id,
          User: rule.creatorId,
          Created: date,
        };
        await updateOrCreate(automodData, query, updateData, createData);
      })
    );
  }

  async function scrapeBans(guild, settingsData) {
    if (settingsData && settingsData.Bans === false) return;

    const bans = await guild.bans.fetch();
    await Promise.all(
      bans.map(async (ban) => {
        const query = { Guild: guild.id, User: ban.user.id };
        const updateData = {
          Reason: ban.reason || "none",
        };
        const createData = {
          ...updateData,
          Guild: guild.id,
          User: ban.user.id,
          Created: date,
        };
        await updateOrCreate(bansData, query, updateData, createData);
      })
    );
  }

  async function scrapeEmojis(guild, settingsData) {
    if (settingsData && settingsData.Emojis === false) return;

    const emojis = await guild.emojis.fetch();
    await Promise.all(
      emojis.map(async (emoji) => {
        const query = { Guild: guild.id, Emoji: emoji.id };
        const updateData = {
          Name: emoji.name || "none",
          Animated: emoji.animated || null,
          Image: emoji.imageURL({ size: 128 }),
        };
        const createData = {
          ...updateData,
          Guild: guild.id,
          Emoji: emoji.id,
          Created: emoji.createdAt,
        };
        await updateOrCreate(emojisData, query, updateData, createData);
      })
    );
  }

  async function scrapeChannels(guild, settingsData) {
    if (settingsData && settingsData.Channels === false) return;

    const channels = await guild.channels.fetch();
    await Promise.all(
      channels.map(async (channel) => {
        const query = { Guild: guild.id, Channel: channel.id };
        const updateData = {
          Name: channel.name,
          Parent: channel.parentId || null,
          Type: channel.type,
          Topic: channel.topic || null,
        };
        const createData = {
          ...updateData,
          Guild: guild.id,
          Channel: channel.id,
          Created: channel.createdAt,
        };
        await updateOrCreate(channelsData, query, updateData, createData);
      })
    );
  }

  async function scrapeInvites(guild, settingsData) {
    if (settingsData && settingsData.Invites === false) return;

    const invites = await guild.invites.fetch();
    await Promise.all(
      invites.map(async (invite) => {
        const query = { Guild: guild.id, Invite: invite.code };
        const updateData = {
          Uses: invite.uses,
        };
        const createData = {
          ...updateData,
          Guild: guild.id,
          Invite: invite.code,
          User: invite.inviter.id,
          Uses: invite.uses || null,
          maxUses: invite.maxUses || null,
          Permanent: null,
          Created: invite.createdAt || null,
        };
        await updateOrCreate(invitesData, query, updateData, createData);
      })
    );
  }

  async function scrapeMembers(guild, settingsData) {
    if (settingsData && settingsData.Members === false) return;

    const members = await guild.members.fetch();
    await Promise.all(
      members.map(async (member) => {
        const query = { Guild: guild.id, User: member.user.id };
        const updateData = {
          Joined: member.joinedAt || null,
          Name: member.user.username,
          Nickname: member.nickname || null,
          Displayname: member.displayName,
          Avatar: member.user.avatarURL({ size: 512 }) || null,
          Banner: member.user.bannerURL({ size: 512 }) || null,
          Roles: member.roles.cache.map((role) => role.id) || [],
        };
        const createData = {
          ...updateData,
          Guild: guild.id,
          User: member.user.id,
          Created: member.user.createdAt,
        };
        await updateOrCreate(membersData, query, updateData, createData);
      })
    );
  }

  async function scrapeRoles(guild, settingsData) {
    if (settingsData && settingsData.Roles === false) return;

    const roles = await guild.roles.fetch();
    await Promise.all(
      roles.map(async (role) => {
        const query = { Guild: guild.id, Role: role.id };
        const updateData = {
          Name: role.name,
          Color: role.hexColor,
          Permissions: role.permissions.toArray(),
        };
        const createData = {
          ...updateData,
          Guild: guild.id,
          Role: role.id,
          Name: role.name,
          Permissions: role.permissions.toArray(),
          Color: role.hexColor,
          Created: role.createdAt,
        };
        await updateOrCreate(rolesData, query, updateData, createData);
      })
    );
  }

  async function scrapeStickers(guild, settingsData) {
    if (settingsData && settingsData.Stickers === false) return;

    const stickers = await guild.stickers.fetch();
    await Promise.all(
      stickers.map(async (sticker) => {
        const query = { Guild: guild.id, Sticker: sticker.id };
        const updateData = {
          Name: sticker.name,
          Description: sticker.description || null,
          Available: sticker.available || null,
        };
        const createData = {
          ...updateData,
          Guild: guild.id,
          Sticker: sticker.id,
          Created: sticker.createdAt,
        };
        await updateOrCreate(stickersData, query, updateData, createData);
      })
    );
  }

  await scrapeAutomod(guild, settingsData);
  await scrapeBans(guild, settingsData);
  await scrapeChannels(guild, settingsData);
  await scrapeEmojis(guild, settingsData);
  await scrapeInvites(guild, settingsData);
  await scrapeMembers(guild, settingsData);
  await scrapeRoles(guild, settingsData);
  await scrapeStickers(guild, settingsData);
});

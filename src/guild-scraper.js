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

  if (settingsData.Store === false) return;

  const automod = await guild.autoModerationRules.fetch();
  const bans = await guild.bans.fetch();
  const channels = await guild.channels.fetch();
  const emojis = await guild.emojis.fetch();
  const invites = await guild.invites.fetch();
  const members = await guild.members.fetch();
  const roles = await guild.roles.fetch();
  const stickers = await guild.stickers.fetch();

  const date = new Date();

  automod.forEach(async (rule) => {
    const data = await automodData.findOne({
      Guild: guild.id,
      Rule: rule.id,
    });

    try {
      if (settingsData.Automod === false) return;
      if (data) {
        await automodData.findOneAndUpdate(
          { Guild: guild.id, Rule: rule.id },
          {
            Name: rule.name,
            Trigger: rule.triggerType,
            Action: rule.actions[0].type,
            Enabled: rule.enabled,
          }
        );
      } else {
        await automodData.create({
          Guild: guild.id,
          Name: rule.name,
          Rule: rule.id,
          User: rule.creatorId,
          Trigger: rule.triggerType,
          Action: rule.actions[0].type,
          Enabled: rule.enabled,
          Created: date,
        });
      }
    } catch (err) {
      console.log(err);
    }
  });

  bans.forEach(async (ban) => {
    const data = await bansData.findOne({
      Guild: guild.id,
      User: ban.user.id,
    });
    try {
      if (settingsData.Bans === false) return;
      if (!data)
        await bansData.create({
          Guild: guild.id,
          User: ban.user.id,
          Created: date,
          Reason: ban.reason || "none",
        });
    } catch (err) {
      console.log(err);
    }
  });

  emojis.forEach(async (emoji) => {
    const data = await emojisData.findOne({
      Guild: guild.id,
      User: emoji.id,
    });

    try {
      if (settingsData.Emojis === false) return;
      if (data) {
        await emojisData.findByIdAndUpdate(
          {
            Guild: guild.id,
            Emoji: emoji.id,
          },
          {
            Name: emoji.name || "none",
            Animated: emoji.animated || null,
            Image: emoji.imageURL({ size: 128 }),
          }
        );
      } else {
        await emojisData.create({
          Guild: guild.id,
          Emoji: emoji.id,
          Name: emoji.name || "none",
          Animated: emoji.animated || null,
          Created: emoji.createdAt,
          Image: emoji.imageURL({ size: 128 }),
        });
      }
    } catch (err) {
      console.log(err);
    }
  });

  channels.forEach(async (channel) => {
    const data = await channelsData.findOne({
      Guild: guild.id,
      Channel: channel.id,
    });

    try {
      if (settingsData.Channels === false) return;
      if (data) {
        await channelsData.findOneAndUpdate(
          { Guild: guild.id, Channel: channel.id },
          {
            Name: channel.name,
            Parent: channel.parent.id || null,
            Type: channel.type,
            Topic: channel.topic || null,
          }
        );
      } else {
        await channelsData.create({
          Guild: guild.id,
          Channel: channel.id,
          Name: channel.name,
          Parent: channel.parent.id,
          Type: channel.type,
          Created: channel.createdAt,
          Topic: channel.topic || null,
        });
      }
    } catch (err) {
      console.log(err);
    }
  });

  invites.forEach(async (invite) => {
    const data = await invitesData.findOne({
      Guild: guild.id,
      Invite: invite,
    });

    try {
      if (settingsData.Invites === false) return;
      if (data) {
        await channelsData.findOneAndUpdate(
          { Guild: guild.id, Invite: invite },
          {
            Uses: invite.uses,
          }
        );
      } else {
        if (invite.maxUses === 0) {
          await channelsData.create({
            Guild: guild.id,
            Invite: invite.code,
            User: invite.inviter.id,
            Uses: invite.uses || null,
            maxUses: invite.maxUses,
            Permanent: true,
            Created: invite.createdAt || null,
          });
        } else {
          await channelsData.create({
            Guild: guild.id,
            Invite: invite.code,
            User: invite.inviter.id,
            Uses: invite.uses || null,
            maxUses: invite.maxUses || null,
            Permanent: false,
            Created: invite.createdAt || null,
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  });

  members.forEach(async (member) => {
    const data = await membersData.findOne({
      Guild: guild.id,
      User: member.user.id,
    });

    try {
      if (settingsData.Members === false) return;
      if (data) {
        await membersData.findOneAndUpdate(
          { Guild: guild.id, User: member.user.id },
          {
            Joined: member.joinedAt || null,
            Name: member.user.username,
            Nickname: member.nickname || null,
            Displayname: member.displayName,
            Avatar: member.user.avatarURL({ size: 512 }) || null,
            Banner: member.user.bannerURL({ size: 512 }) || null,
            Roles: member.roles.cache.map((role) => role.id) || [],
          }
        );
      } else {
        await membersData.create({
          Guild: guild.id,
          User: member.user.id,
          Joined: member.joinedAt || null,
          Created: member.user.createdAt,
          Name: member.user.username,
          Nickname: member.nickname,
          Displayname: member.displayName || null,
          Avatar: member.user.avatarURL({ size: 512 }) || null,
          Banner: member.user.bannerURL({ size: 512 }) || null,
          Roles: member.roles.cache.map((role) => role.id) || [],
        });
      }
    } catch (err) {
      console.log(err);
    }
  });

  roles.forEach(async (role) => {
    const data = await rolesData.findOne({
      Guild: guild.id,
      Role: role.id,
    });

    try {
      if (settingsData.Roles === false) return;
      if (data) {
        await rolesData.findOneAndUpdate(
          { Guild: guild.id, Role: role.id },
          {
            Name: role.name,
            Color: role.hexColor,
            Permissions: role.permissions.toArray(),
          }
        );
      } else {
        await rolesData.create({
          Guild: guild.id,
          Role: role.id,
          Name: role.name,
          Permissions: role.permissions.toArray(),
          Color: role.hexColor,
          Created: role.createdAt,
        });
      }
    } catch (err) {
      console.log(err);
    }
  });

  stickers.forEach(async (sticker) => {
    const data = await stickersData.findOne({
      Guild: guild.id,
      Sticker: sticker.id,
    });

    try {
      if (settingsData.Stickers === false) return;
      if (data) {
        await stickersData.findOneAndUpdate(
          { Guild: guild.id, Sticker: sticker.id },
          {
            Name: sticker.name,
            Description: sticker.description || null,
            Available: sticker.available || null,
          }
        );
      } else {
        await stickersData.create({
          Guild: guild.id,
          Sticker: sticker.id,
          Name: sticker.name,
          Created: sticker.createdAt,
          Description: sticker.description || null,
          Available: sticker.available || null,
        });
      }
    } catch (err) {
      console.log(err);
    }
  });
});

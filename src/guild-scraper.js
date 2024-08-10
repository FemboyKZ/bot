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

const { client } = require("./index.js");
require("dotenv").config();

// Only runs on FKZ, no plans on making it work on other guilds

client.on("ready", async () => {
  const guild = await client.guilds.cache.get(`${process.env.GUILD_ID}`); // fkz
  if (!guild) return;

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
      if (!data)
        await bansData.create({
          Guild: guild.id,
          User: ban.user.id,
          Created: date,
          Executor: ban.executor.id,
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
      if (data) {
        await emojisData.findByIdAndUpdate(
          {
            Guild: guild.id,
            Emoji: emoji.id,
          },
          {
            Name: emoji.name || "none",
            Animated: emoji.animated || null,
          }
        );
      } else {
        await emojisData.create({
          Guild: guild.id,
          Emoji: emoji.id,
          Name: emoji.name || "none",
          Animated: emoji.animated || null,
          Created: date,
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
            Invite: invite,
            User: invite.inviter.id,
            Uses: invite.uses || null,
            maxUses: invite.maxUses,
            Code: invite.code,
            Permanent: true,
            Created: invite.createdAt || null,
          });
        } else {
          await channelsData.create({
            Guild: guild.id,
            Invite: invite,
            User: invite.inviter.id,
            Uses: invite.uses || null,
            maxUses: invite.maxUses || null,
            Code: invite.code,
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
    const roles = member.roles.cache.map((role) => role.id);

    try {
      if (data) {
        await membersData.findOneAndUpdate(
          { Guild: guild.id, User: member.user.id },
          {
            Joined: member.joinedAt || null,
            Name: member.user.username,
            Nickname: member.nickname || null,
            Avatar: member.user.avatarURL({ size: 512 }) || null,
            Banner: member.user.bannerURL({ size: 512 }) || null,
            Roles: roles || [],
          }
        );
      } else {
        await membersData.create({
          Guild: guild.id,
          User: member.user.id,
          Joined: member.joinedAt || null,
          Created: member.user.createdAt,
          Name: member.user.username,
          Nickname: member.nickname || null,
          Avatar: member.user.avatarURL({ size: 512 }) || null,
          Banner: member.user.bannerURL({ size: 512 }) || null,
          Roles: roles || [],
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
      if (data) {
        await rolesData.findOneAndUpdate(
          { Guild: guild.id, Role: role.id },
          {
            Name: role.name,
            Color: role.hexColor,
            Hoisted: role.hoist,
            Created: role.createdAt,
            Permissions: role.permissions || null,
          }
        );
      } else {
        await rolesData.create({
          Guild: guild.id,
          Role: role.id,
          Name: role.name,
          Color: role.hexColor,
          Hoisted: role.hoist,
          Created: role.createdAt,
          Permissions: role.permissions || null,
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

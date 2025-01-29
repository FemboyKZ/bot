const automodData = require("./schemas/events/automodRules.js");
const banData = require("./schemas/events/bans.js");
const channelData = require("./schemas/events/channels.js");
const emojiData = require("./schemas/events/emojis.js");
const guildData = require("./schemas/events/guilds.js");
const inviteData = require("./schemas/events/invites.js");
const memberData = require("./schemas/events/members.js");
const roleData = require("./schemas/events/roles.js");
const stickerData = require("./schemas/events/stickers.js");
// const threadsData = require("./schemas/events/threads.js"); // TODO: Add threads schema

require("dotenv").config();

module.exports = (client) => {
  client.syncGuild = async (guild) => {
    try {
      await guild.fetch();

      const dbGuild = await guildData.find({ Guild: guild.id });
      if (!dbGuild) {
        return console.warn(`No guild data found for guild: ${guild.name}`);
      }

      const dbGuildMap = new Map(dbGuild.map((guild) => [guild.Guild, guild]));

      for (const [guildId, guild] of client.guilds.cache) {
        const guildNewData = {
          Guild: guild.id,
          Name: guild.name,
          User: guild.ownerId,
          Created: guild.createdAt,
          Icon: guild.iconURL() || null,
          Banner: guild.bannerURL() || null,
          Vanity: guild.vanityURLCode || null,
          Channels: guild.channels.cache.map((channel) => channel.id),
          Emojis: guild.emojis.cache.map((emoji) => emoji.id),
          Stickers: guild.stickers.cache.map((sticker) => sticker.id),
          Roles: guild.roles.cache.map((role) => role.id),
          Members: guild.members.cache.map((member) => member.id),
        };

        if (dbGuildMap.has(guildId)) {
          await guildData.updateOne({ Guild: guildId }, guildNewData);
          dbGuildMap.delete(guildId);
        } else {
          await guildData.create(guildNewData);
        }
      }

      for (const [guildId] of dbGuildMap) {
        await guildData.deleteOne({ Guild: guildId });
      }

      console.log(`Synced guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing data for guild: ${guild.name}`, error);
    }
  };

  client.syncGuildAutomodRules = async (guild) => {
    try {
      const automodRules = await guild.autoModerationRules.fetch();
      if (!automodRules) {
        return console.warn(`No automod rules found for guild: ${guild.name}`);
      }

      const dbAutoModRules = await automodData.find({ Guild: guild.id });
      if (!dbAutoModRules) {
        return console.warn(`No automod data found for guild: ${guild.name}`);
      }

      const dbAutoModRuleMap = new Map(
        dbAutoModRules.map((rule) => [rule.Rule, rule]),
      );

      for (const [ruleId, rule] of automodRules) {
        const triggers = [];
        if (rule.triggerMetadata) {
          if (rule.triggerMetadata.keywordFilter) {
            triggers.push({
              Type: "KEYWORD",
              Keywords: rule.triggerMetadata.keywordFilter,
            });
          }
          if (rule.triggerMetadata.mentionTotalLimit) {
            triggers.push({
              Type: "MENTION_SPAM",
              MentionLimit: rule.triggerMetadata.mentionTotalLimit,
            });
          }
          if (rule.triggerMetadata.presets) {
            triggers.push({
              Type: "KEYWORD_PRESET",
              Presets: rule.triggerMetadata.presets,
            });
          }
          if (rule.triggerMetadata.regexPatterns) {
            triggers.push({
              Type: "REGEX",
              RegexPatterns: rule.triggerMetadata.regexPatterns,
            });
          }
        }

        const actions = rule.actions.map((action) => ({
          Type: action.type,
          Metadata: action.metadata || {},
        }));

        const automodNewData = {
          Guild: guild.id,
          Rule: ruleId,
          User: rule.creatorId,
          Name: rule.name,
          Created: rule.createdAt,
          Enabled: rule.enabled,
          Triggers: triggers,
          Actions: actions,
        };

        if (dbAutoModRuleMap.has(ruleId)) {
          await automodData.updateOne({ Rule: ruleId }, automodNewData);
          dbAutoModRuleMap.delete(ruleId);
        } else {
          await automodData.create(automodNewData);
        }
      }

      for (const [ruleId] of dbAutoModRuleMap) {
        await automodData.deleteOne({ Rule: ruleId });
      }

      console.log(`Synced AutoMod rules for guild: ${guild.name}`);
    } catch (error) {
      console.error(
        `Error syncing AutoMod rules for guild ${guild.name}:`,
        error,
      );
    }
  };

  client.syncGuildBans = async (guild) => {
    try {
      await guild.bans.fetch();

      const dbBans = await banData.find({ Guild: guild.id });
      if (!dbBans) {
        return console.warn(`No bans data found for guild: ${guild.name}`);
      }

      const dbBanMap = new Map(dbBans.map((ban) => [ban.User, ban]));

      for (const [userId, ban] of guild.bans.cache) {
        const banNewData = {
          Guild: guild.id,
          User: userId,
          Created: ban.createdAt,
          Reason: ban.reason,
        };

        if (dbBanMap.has(userId)) {
          await banData.updateOne({ User: userId }, banNewData);
          dbBanMap.delete(userId);
        } else {
          await banData.create(banNewData);
        }
      }

      for (const [userId] of dbBanMap) {
        await banData.deleteOne({ User: userId });
      }

      console.log(`Synced bans for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing bans for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildChannels = async (guild) => {
    try {
      await guild.channels.fetch();

      const dbChannels = await channelData.find({ Guild: guild.id });
      if (!dbChannels) {
        return console.warn(`No channels data found for guild: ${guild.name}`);
      }

      const dbChannelMap = new Map(
        dbChannels.map((channel) => [channel.Channel, channel]),
      );

      for (const [channelId, channel] of guild.channels.cache) {
        const channelNewData = {
          Guild: guild.id,
          Channel: channelId,
          Name: channel.name,
          Parent: channel.parentId,
          Type: channel.type,
          Topic: channel.topic,
        };

        if (dbChannelMap.has(channelId)) {
          await channelData.updateOne({ Channel: channelId }, channelNewData);
          dbChannelMap.delete(channelId);
        } else {
          await channelData.create(channelNewData);
        }
      }

      for (const [channelId] of dbChannelMap) {
        await channelData.deleteOne({ Channel: channelId });
      }

      console.log(`Synced channels for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing channels for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildEmojis = async (guild) => {
    try {
      const dbEmojis = await emojiData.find({ Guild: guild.id });
      if (!dbEmojis) {
        return console.warn(`No emojis data found for guild: ${guild.name}`);
      }

      const dbEmojiMap = new Map(dbEmojis.map((emoji) => [emoji.Emoji, emoji]));

      for (const [emojiId, emoji] of guild.emojis.cache) {
        const emojiNewData = {
          Guild: guild.id,
          Emoji: emojiId,
          Name: emoji.name,
          Animated: emoji.animated,
          Created: emoji.createdAt,
          Image: emoji.url,
        };

        if (dbEmojiMap.has(emojiId)) {
          await emojiData.updateOne({ Emoji: emojiId }, emojiNewData);
          dbEmojiMap.delete(emojiId);
        } else {
          await emojiData.create(emojiNewData);
        }
      }

      for (const [emojiId] of dbEmojiMap) {
        await emojiData.deleteOne({ Emoji: emojiId });
      }

      console.log(`Synced emojis for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing emojis for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildInvites = async (guild) => {
    try {
      const dbInvites = await inviteData.find({ Guild: guild.id });
      if (!dbInvites) {
        return console.warn(`No invites data found for guild: ${guild.name}`);
      }

      const dbInviteMap = new Map(
        dbInvites.map((invite) => [invite.Code, invite]),
      );

      const invites = await guild.invites.fetch();
      for (const [inviteCode, invite] of invites) {
        const inviteNewData = {
          Guild: guild.id,
          Invite: inviteCode,
          //User: invite.inviter.id,
          Uses: invite.uses,
          MaxUses: invite.maxUses,
          Expires: invite.expiresAt,
          Created: invite.createdAt,
        };

        if (dbInviteMap.has(inviteCode)) {
          await inviteData.updateOne({ Code: inviteCode }, inviteNewData);
          dbInviteMap.delete(inviteCode);
        } else {
          await inviteData.create(inviteNewData);
        }
      }

      for (const [inviteCode] of dbInviteMap) {
        await inviteData.deleteOne({ Code: inviteCode });
      }

      console.log(`Synced invites for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing invites for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildMembers = async (guild) => {
    try {
      await guild.members.fetch();

      const dbMembers = await memberData.find({ Guild: guild.id });
      if (!dbMembers) {
        return console.warn(`No members data found for guild: ${guild.name}`);
      }

      const dbMemberMap = new Map(
        dbMembers.map((member) => [member.User, member]),
      );

      for (const [userId, guildMember] of guild.members.cache) {
        const memberNewData = {
          Guild: guild.id,
          User: userId,
          Name: guildMember.user.username,
          Nickname: guildMember.nickname,
          Displayname: guildMember.displayName,
          Avatar: guildMember.user.displayAvatarURL(),
          Banner: guildMember.user.bannerURL() || null,
          Roles: guildMember.roles.cache.map((role) => role.id),
          Joined: guildMember.joinedAt,
          Created: guildMember.user.createdAt,
        };

        if (dbMemberMap.has(userId)) {
          await memberData.updateOne({ User: userId }, memberNewData);
          dbMemberMap.delete(userId);
        } else {
          await memberData.create(memberNewData);
        }
      }

      for (const [userId] of dbMemberMap) {
        await memberData.deleteOne({ User: userId });
      }

      console.log(`Synced members for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing members for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildRoles = async (guild) => {
    try {
      await guild.roles.fetch();

      const dbRoles = await roleData.find({ Guild: guild.id });
      if (!dbRoles) {
        return console.warn(`No roles data found for guild: ${guild.name}`);
      }

      const dbRoleMap = new Map(dbRoles.map((role) => [role.Role, role]));

      for (const [roleId, role] of guild.roles.cache) {
        const roleNewData = {
          Guild: guild.id,
          Role: roleId,
          Name: role.name,
          Color: role.hexColor,
          Hoist: role.hoist,
          Mentionable: role.mentionable,
          Permissions: role.permissions.toArray(),
          Position: role.position,
        };

        if (dbRoleMap.has(roleId)) {
          await roleData.updateOne({ Role: roleId }, roleNewData);
          dbRoleMap.delete(roleId);
        } else {
          await roleData.create(roleNewData);
        }
      }

      for (const [roleId] of dbRoleMap) {
        await roleData.deleteOne({ Role: roleId });
      }

      console.log(`Synced roles for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing roles for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildStickers = async (guild) => {
    try {
      await guild.stickers.fetch();

      const dbStickers = await stickerData.find({ Guild: guild.id });
      if (!dbStickers) {
        return console.warn(`No stickers data found for guild: ${guild.name}`);
      }

      const dbStickerMap = new Map(
        dbStickers.map((sticker) => [sticker.Sticker, sticker]),
      );

      for (const [stickerId, sticker] of guild.stickers.cache) {
        const stickerNewData = {
          Guild: guild.id,
          Sticker: stickerId,
          Name: sticker.name,
          Description: sticker.description,
          Tags: sticker.tags,
          Available: sticker.available,
          Created: sticker.createdAt,
        };

        if (dbStickerMap.has(stickerId)) {
          await stickerData.updateOne({ Sticker: stickerId }, stickerNewData);
          dbStickerMap.delete(stickerId);
        } else {
          await stickerData.create(stickerNewData);
        }
      }

      for (const [stickerId] of dbStickerMap) {
        await stickerData.deleteOne({ Sticker: stickerId });
      }

      console.log(`Synced stickers for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing stickers for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildData = async (guild) => {
    await client.syncGuild(guild);
    await client.syncGuildAutomodRules(guild);
    await client.syncGuildBans(guild);
    await client.syncGuildChannels(guild);
    await client.syncGuildEmojis(guild);
    await client.syncGuildInvites(guild);
    await client.syncGuildMembers(guild);
    await client.syncGuildRoles(guild);
    await client.syncGuildStickers(guild);
  };
};

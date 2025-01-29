const automodData = require("./schemas/events/automod.js");
const bansData = require("./schemas/events/bans.js");
const channelsData = require("./schemas/events/channels.js");
const emojisData = require("./schemas/events/emojis.js");
const guildsData = require("./schemas/events/guilds.js");
const invitesData = require("./schemas/events/invites.js");
const membersData = require("./schemas/events/members.js");
// const messagesData = require("./schemas/events/messages.js"); // only logging deleted/edited
const rolesData = require("./schemas/events/roles.js");
const stickersData = require("./schemas/events/stickers.js");
// const threadsData = require("./schemas/events/threads.js"); // pointless

require("dotenv").config();

module.exports = (client) => {
  client.syncGuild = async (guild) => {
    // TODO: Add more data to sync
    try {
      await guild.fetch();

      const dbGuild = await guildsData.find({ Guild: guild.id });
      if (!dbGuild) {
        return console.warn(`No guild data found for guild: ${guild.name}`);
      }

      const dbGuildMap = new Map(dbGuild.map((guild) => [guild.Guild, guild]));

      for (const [guildId, guild] of client.guilds.cache) {
        const guildsNewData = {
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
          await guildsData.updateOne({ Guild: guildId }, guildsNewData);
          dbGuildMap.delete(guildId);
        } else {
          await guildsData.create(guildsNewData);
        }
      }

      for (const [guildId] of dbGuildMap) {
        await guildsData.deleteOne({ Guild: guildId });
      }

      console.log(`Synced guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing data for guild: ${guild.name}`, error);
    }
  };

  client.syncGuildAutomod = async (guild) => {
    try {
      const dbAutomod = await automodData.find({ Guild: guild.id });
      if (!dbAutomod) {
        return console.warn(`No automod data found for guild: ${guild.name}`);
      }

      const dbAutomodMap = new Map(
        dbAutomod.map((automod) => [automod.Rule, automod]),
      );

      for (const [ruleId, rule] of guild.autoMod.rules) {
        const automodNewData = {
          Guild: guild.id,
          Rule: ruleId,
          Enabled: rule.enabled,
        };

        if (dbAutomodMap.has(ruleId)) {
          await automodData.updateOne({ Rule: ruleId }, automodNewData);
          dbAutomodMap.delete(ruleId);
        } else {
          await automodData.create(automodNewData);
        }
      }

      for (const [ruleId] of dbAutomodMap) {
        await automodData.deleteOne({ Rule: ruleId });
      }

      console.log(`Synced automod for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing automod for guild: ${guild.name}`, error);
    }
  };

  client.syncGuildBans = async (guild) => {
    try {
      await guild.bans.fetch();

      const dbBans = await bansData.find({ Guild: guild.id });
      if (!dbBans) {
        return console.warn(`No bans data found for guild: ${guild.name}`);
      }

      const dbBanMap = new Map(dbBans.map((ban) => [ban.User, ban]));

      for (const [userId, ban] of guild.bans.cache) {
        const banData = {
          Guild: guild.id,
          User: userId,
          Created: ban.createdAt,
          Reason: ban.reason,
        };

        if (dbBanMap.has(userId)) {
          await bansData.updateOne({ User: userId }, banData);
          dbBanMap.delete(userId);
        } else {
          await bansData.create(banData);
        }
      }

      for (const [userId] of dbBanMap) {
        await bansData.deleteOne({ User: userId });
      }

      console.log(`Synced bans for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing bans for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildChannels = async (guild) => {
    try {
      await guild.channels.fetch();

      const dbChannels = await channelsData.find({ Guild: guild.id });
      if (!dbChannels) {
        return console.warn(`No channels data found for guild: ${guild.name}`);
      }

      const dbChannelMap = new Map(
        dbChannels.map((channel) => [channel.Channel, channel]),
      );

      for (const [channelId, channel] of guild.channels.cache) {
        const channelData = {
          Guild: guild.id,
          Channel: channelId,
          Name: channel.name,
          Parent: channel.parentId,
          Type: channel.type,
          Topic: channel.topic,
        };

        if (dbChannelMap.has(channelId)) {
          await channelsData.updateOne({ Channel: channelId }, channelData);
          dbChannelMap.delete(channelId);
        } else {
          await channelsData.create(channelData);
        }
      }

      for (const [channelId] of dbChannelMap) {
        await channelsData.deleteOne({ Channel: channelId });
      }

      console.log(`Synced channels for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing channels for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildEmojis = async (guild) => {
    try {
      const dbEmojis = await emojisData.find({ Guild: guild.id });
      if (!dbEmojis) {
        return console.warn(`No emojis data found for guild: ${guild.name}`);
      }

      const dbEmojiMap = new Map(dbEmojis.map((emoji) => [emoji.Emoji, emoji]));

      for (const [emojiId, emoji] of guild.emojis.cache) {
        const emojiData = {
          Guild: guild.id,
          Emoji: emojiId,
          Name: emoji.name,
          Animated: emoji.animated,
          Created: emoji.createdAt,
          Image: emoji.url,
        };

        if (dbEmojiMap.has(emojiId)) {
          await emojisData.updateOne({ Emoji: emojiId }, emojiData);
          dbEmojiMap.delete(emojiId);
        } else {
          await emojisData.create(emojiData);
        }
      }

      for (const [emojiId] of dbEmojiMap) {
        await emojisData.deleteOne({ Emoji: emojiId });
      }

      console.log(`Synced emojis for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing emojis for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildInvites = async (guild) => {
    try {
      const dbInvites = await invitesData.find({ Guild: guild.id });
      if (!dbInvites) {
        return console.warn(`No invites data found for guild: ${guild.name}`);
      }

      const dbInviteMap = new Map(
        dbInvites.map((invite) => [invite.Code, invite]),
      );

      const invites = await guild.invites.fetch();
      for (const [inviteCode, invite] of invites) {
        const inviteData = {
          Guild: guild.id,
          Invite: inviteCode,
          //User: invite.inviter.id,
          Uses: invite.uses,
          MaxUses: invite.maxUses,
          Expires: invite.expiresAt,
          Created: invite.createdAt,
        };

        if (dbInviteMap.has(inviteCode)) {
          await invitesData.updateOne({ Code: inviteCode }, inviteData);
          dbInviteMap.delete(inviteCode);
        } else {
          await invitesData.create(inviteData);
        }
      }

      for (const [inviteCode] of dbInviteMap) {
        await invitesData.deleteOne({ Code: inviteCode });
      }

      console.log(`Synced invites for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing invites for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildMembers = async (guild) => {
    try {
      await guild.members.fetch();

      const dbMembers = await membersData.find({ Guild: guild.id });
      if (!dbMembers) {
        return console.warn(`No members data found for guild: ${guild.name}`);
      }

      const dbMemberMap = new Map(
        dbMembers.map((member) => [member.User, member]),
      );

      for (const [userId, guildMember] of guild.members.cache) {
        const memberData = {
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
          await membersData.updateOne({ User: userId }, memberData);
          dbMemberMap.delete(userId);
        } else {
          await membersData.create(memberData);
        }
      }

      for (const [userId] of dbMemberMap) {
        await membersData.deleteOne({ User: userId });
      }

      console.log(`Synced members for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing members for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildRoles = async (guild) => {
    try {
      await guild.roles.fetch();

      const dbRoles = await rolesData.find({ Guild: guild.id });
      if (!dbRoles) {
        return console.warn(`No roles data found for guild: ${guild.name}`);
      }

      const dbRoleMap = new Map(dbRoles.map((role) => [role.Role, role]));

      for (const [roleId, role] of guild.roles.cache) {
        const roleData = {
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
          await rolesData.updateOne({ Role: roleId }, roleData);
          dbRoleMap.delete(roleId);
        } else {
          await rolesData.create(roleData);
        }
      }

      for (const [roleId] of dbRoleMap) {
        await rolesData.deleteOne({ Role: roleId });
      }

      console.log(`Synced roles for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing roles for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildStickers = async (guild) => {
    try {
      await guild.stickers.fetch();

      const dbStickers = await stickersData.find({ Guild: guild.id });
      if (!dbStickers) {
        return console.warn(`No stickers data found for guild: ${guild.name}`);
      }

      const dbStickerMap = new Map(
        dbStickers.map((sticker) => [sticker.Sticker, sticker]),
      );

      for (const [stickerId, sticker] of guild.stickers.cache) {
        const stickerData = {
          Guild: guild.id,
          Sticker: stickerId,
          Name: sticker.name,
          Description: sticker.description,
          Tags: sticker.tags,
          Available: sticker.available,
          Created: sticker.createdAt,
        };

        if (dbStickerMap.has(stickerId)) {
          await stickersData.updateOne({ Sticker: stickerId }, stickerData);
          dbStickerMap.delete(stickerId);
        } else {
          await stickersData.create(stickerData);
        }
      }

      for (const [stickerId] of dbStickerMap) {
        await stickersData.deleteOne({ Sticker: stickerId });
      }

      console.log(`Synced stickers for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing stickers for guild ${guild.name}:`, error);
    }
  };

  client.syncGuildData = async (guild) => {
    await client.syncGuild(guild);
    await client.syncGuildAutomod(guild);
    await client.syncGuildBans(guild);
    await client.syncGuildChannels(guild);
    await client.syncGuildEmojis(guild);
    await client.syncGuildInvites(guild);
    await client.syncGuildMembers(guild);
    await client.syncGuildRoles(guild);
    await client.syncGuildStickers(guild);
  };
};

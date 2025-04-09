const automodData = require("../schemas/events/automodRules.js");
const banData = require("../schemas/events/bans.js");
const channelData = require("../schemas/events/channels.js");
const emojiData = require("../schemas/events/emojis.js");
const guildData = require("../schemas/events/guilds.js");
const inviteData = require("../schemas/events/invites.js");
const memberData = require("../schemas/events/members.js");
const roleData = require("../schemas/events/roles.js");
const stickerData = require("../schemas/events/stickers.js");
const threadData = require("../schemas/events/threads.js");
require("dotenv").config();

async function syncData({
  dbCollection,
  guildId,
  dbKey,
  liveCache,
  createNewData,
  deleteConditions = {},
}) {
  const baseFilter = {
    Guild: guildId,
    ...deleteConditions,
  };
  const dbData = (await dbCollection.find(baseFilter)) || [];
  const dbMap = new Map(dbData.map((item) => [item[dbKey], item]));

  const bulkOps = [];
  const seenIds = new Set();

  for (const [id, item] of liveCache) {
    const existing = dbMap.get(id);
    const newData = createNewData(item);

    if (existing) {
      bulkOps.push({
        updateOne: {
          filter: { _id: existing._id },
          update: { $set: newData },
        },
      });
      seenIds.add(existing._id.toString());
    } else {
      bulkOps.push({
        insertOne: {
          document: newData,
        },
      });
    }
  }

  const toDelete = dbData.filter((doc) => !seenIds.has(doc._id.toString()));
  for (const doc of toDelete) {
    bulkOps.push({
      deleteOne: {
        filter: {
          _id: doc._id,
          ...baseFilter,
        },
      },
    });
  }

  if (bulkOps.length > 0) {
    try {
      await dbCollection.bulkWrite(bulkOps, { ordered: false });
    } catch (error) {
      if (error.code === 11000) {
        console.warn(
          "Duplicate key error, retrying with individual operations...",
        );
        await handleDuplicateKeys(error, dbCollection, bulkOps);
      } else {
        throw error;
      }
    }
  }
}

async function handleDuplicateKeys(error, collection, bulkOps) {
  const successOps = [];

  for (const op of bulkOps) {
    try {
      if (op.insertOne) {
        await collection.create(op.insertOne.document);
      } else {
        await collection.updateOne(op.updateOne.filter, op.updateOne.update);
      }
      successOps.push(op);
    } catch (err) {
      if (err.code === 11000) {
        console.warn(`Skipping duplicate document: ${err.message}`);
      } else {
        throw err;
      }
    }
  }
}

module.exports = (client) => {
  client.syncGuild = async (guild) => {
    try {
      if (!guild?.id) throw new Error("Invalid guild object");

      await guild.fetch();
      const dbGuild = await guildData.findOne({ Guild: guild.id });

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

      if (dbGuild) {
        await guildData.updateOne({ Guild: guild.id }, guildNewData);
      } else {
        await guildData.create(guildNewData);
      }

      console.log(`Synced guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing guild ${guild.name}:`, error);
      throw error;
    }
  };

  client.syncGuildAutomodRules = async (guild) => {
    try {
      const automodRules = await guild.autoModerationRules.fetch();
      await syncData({
        dbCollection: automodData,
        guildId: guild.id,
        dbKey: "Rule",
        liveCache: automodRules,
        createNewData: (rule) => ({
          Guild: guild.id,
          Rule: rule.id,
          User: rule.creatorId,
          Name: rule.name,
          Created: rule.createdAt,
          Enabled: rule.enabled,
          Triggers: processTriggers(rule),
          Actions: rule.actions.map((action) => ({
            Type: action.type,
            Metadata: action.metadata || {},
          })),
        }),
      });
      console.log(`Synced automod rules for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing automod rules for ${guild.name}:`, error);
      throw error;
    }
  };

  client.syncGuildBans = async (guild) => {
    try {
      const bans = await guild.bans.fetch();
      await syncData({
        dbCollection: banData,
        guildId: guild.id,
        dbKey: "User",
        liveCache: bans,
        createNewData: (ban) => ({
          Guild: guild.id,
          User: ban.user.id,
          Created: ban.createdAt,
          Reason: ban.reason || null,
        }),
      });
      console.log(`Synced bans for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing bans for ${guild.name}:`, error);
      throw error;
    }
  };

  client.syncGuildChannels = async (guild) => {
    try {
      const channels = await guild.channels.fetch();
      await syncData({
        dbCollection: channelData,
        guildId: guild.id,
        dbKey: "Channel",
        liveCache: channels,
        createNewData: (channel) => ({
          Guild: guild.id,
          Channel: channel.id,
          Name: channel.name,
          Type: channel.type,
          Created: channel.createdAt,
          Parent: channel.parentId || null,
          Topic: channel.topic || null,
        }),
      });
      console.log(`Synced channels for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing channels for ${guild.name}:`, error);
      throw error;
    }
  };

  client.syncGuildEmojis = async (guild) => {
    try {
      const emojis = await guild.emojis.fetch();
      await syncData({
        dbCollection: emojiData,
        guildId: guild.id,
        dbKey: "Emoji",
        liveCache: emojis,
        createNewData: (emoji) => ({
          Guild: guild.id,
          Emoji: emoji.id,
          Name: emoji.name,
          Animated: emoji.animated,
          Created: emoji.createdAt,
          Image: emoji.imageURL({ size: 128 }) || null,
        }),
      });
      console.log(`Synced emojis for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing emojis for ${guild.name}:`, error);
      throw error;
    }
  };

  client.syncGuildInvites = async (guild) => {
    try {
      const invites = await guild.invites.fetch();
      await syncData({
        dbCollection: inviteData,
        guildId: guild.id,
        dbKey: "Invite",
        liveCache: invites,
        createNewData: (invite) => ({
          Guild: guild.id,
          Invite: invite.code,
          User: invite.inviter?.id || null,
          Created: invite.createdAt,
          Uses: invite.uses,
          MaxUses: invite.maxUses,
          Permanent: invite.maxAge === 0,
          Expires: invite.expiresAt || null,
        }),
        deleteConditions: [["Guild", guild.id]],
      });
      console.log(`Synced invites for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing invites for ${guild.name}:`, error);
      throw error;
    }
  };

  client.syncGuildMembers = async (guild) => {
    try {
      const members = await guild.members.fetch();
      await syncData({
        dbCollection: memberData,
        guildId: guild.id,
        dbKey: "User",
        liveCache: members,
        createNewData: (member) => ({
          Guild: guild.id,
          User: member.id,
          Name: member.user.username,
          Joined: member.joinedAt,
          Created: member.user.createdAt,
          Nickname: member.nickname || null,
          Displayname: member.displayName || null,
          Avatar: member.avatarURL({ size: 128 }) || null,
          Banner: member.bannerURL({ size: 128 }) || null,
          Roles: member.roles.cache.map((role) => role.id),
        }),
      });
      console.log(`Synced members for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing members for ${guild.name}:`, error);
      throw error;
    }
  };

  client.syncGuildRoles = async (guild) => {
    try {
      const roles = await guild.roles.fetch();
      await syncData({
        dbCollection: roleData,
        guildId: guild.id,
        dbKey: "Role",
        liveCache: roles,
        createNewData: (role) => ({
          Guild: guild.id,
          Role: role.id,
          Name: role.name,
          Color: role.hexColor,
          Hoist: role.hoist,
          Created: role.createdAt,
          Mentionable: role.mentionable,
          Permissions: role.permissions.toArray(),
          Position: role.position,
        }),
      });
      console.log(`Synced roles for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing roles for ${guild.name}:`, error);
      throw error;
    }
  };

  client.syncGuildStickers = async (guild) => {
    try {
      const stickers = await guild.stickers.fetch();
      await syncData({
        dbCollection: stickerData,
        guildId: guild.id,
        dbKey: "Sticker",
        liveCache: stickers,
        createNewData: (sticker) => ({
          Guild: guild.id,
          Sticker: sticker.id,
          Name: sticker.name,
          Description: sticker.description || null,
          Tags: sticker.tags || [],
          Available: sticker.available,
          Created: sticker.createdAt,
        }),
      });
      console.log(`Synced stickers for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing stickers for ${guild.name}:`, error);
      throw error;
    }
  };

  client.syncGuildThreads = async (guild) => {
    try {
      const threads = await guild.channels.cache.filter((channel) =>
        channel.isThread(),
      );
      // const threads = await guild.threads.fetch();
      // TODO: use thread.fetchActive() and thread.fetchArchived() instead?
      if (threads) {
        await syncData({
          dbCollection: threadData,
          guildId: guild.id,
          dbKey: "Thread",
          liveCache: threads,
          createNewData: (thread) => ({
            Guild: guild.id,
            Thread: thread.id,
            Name: thread.name,
            Type: thread.type,
            Created: thread.createdAt,
            User: thread.ownerId || null,
            Locked: thread.locked,
            Archived: thread.archived,
            Auto: thread.autoArchiveDuration || null,
            Parent: thread.parentId || null,
          }),
        });
      }
      console.log(`Synced threads for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error syncing threads for ${guild.name}:`, error);
      throw error;
    }
  };

  client.syncGuildData = async (guild) => {
    try {
      if (!guild?.id) throw new Error("Invalid guild object");

      await Promise.all([
        client.syncGuild(guild),
        client.syncGuildAutomodRules(guild),
        client.syncGuildBans(guild),
        client.syncGuildChannels(guild),
        client.syncGuildEmojis(guild),
        client.syncGuildInvites(guild),
        client.syncGuildMembers(guild),
        client.syncGuildRoles(guild),
        client.syncGuildStickers(guild),
        client.syncGuildThreads(guild),
      ]);

      console.log(`Completed full sync for guild: ${guild.name}`);
    } catch (error) {
      console.error(`Failed to sync guild ${guild.name}:`, error);
      throw error;
    }
  };

  function processTriggers(rule) {
    const triggers = [];
    const triggerMetadata = rule.triggerMetadata || {};

    if (triggerMetadata.keywordFilter) {
      triggers.push({
        Type: "KEYWORD",
        Keywords: triggerMetadata.keywordFilter,
      });
    }

    return triggers;
  }
};

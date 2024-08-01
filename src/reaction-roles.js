const { Events } = require("discord.js");
const reactions = require("./Schemas/reactionrs");
const { client } = require("./index.js");

let lastOnlineTime = Date.now();

client.on("ready", () => {
  lastOnlineTime = Date.now();
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (!reaction || !reaction.message || !reaction.message.guildId || user.bot) {
    return;
  }

  let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
  if (!reaction.emoji.id) {
    cID = reaction.emoji.name;
  }

  try {
    const data = await reactions.findOne({
      Guild: reaction.message.guildId,
      Message: reaction.message.id,
      Emoji: cID,
    });

    if (!data) {
      return;
    }

    const guild = await client.guilds.cache.get(reaction.message.guildId);
    if (!guild) {
      return;
    }

    const member = await guild.members.cache.get(user.id);
    if (!member) {
      return;
    }

    await member.roles.add(data.Role);

    const now = Date.now();
    const offlineTime = lastOnlineTime;
    const reactionTime = reaction.createdTimestamp;
    const offlineDuration = now - offlineTime;
    const reactionDuration = reactionTime - offlineTime;

    if (reactionDuration > offlineDuration) {
      await member.roles.add(data.Role);
    }
  } catch (e) {
    console.error(e);
  }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (!reaction || !reaction.message || !reaction.message.guildId || user.bot) {
    return;
  }

  let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
  if (!reaction.emoji.id) {
    cID = reaction.emoji.name;
  }

  try {
    const data = await reactions.findOne({
      Guild: reaction.message.guildId,
      Message: reaction.message.id,
      Emoji: cID,
    });

    if (!data) {
      return;
    }

    const guild = await client.guilds.cache.get(reaction.message.guildId);
    if (!guild) {
      return;
    }

    const member = await guild.members.cache.get(user.id);
    if (!member) {
      return;
    }

    await member.roles.remove(data.Role);

    const now = Date.now();
    const offlineTime = lastOnlineTime;
    const reactionTime = reaction.createdTimestamp;
    const offlineDuration = now - offlineTime;
    const reactionDuration = reactionTime - offlineTime;

    if (reactionDuration > offlineDuration) {
      await member.roles.remove(data.Role);
    }
  } catch (e) {
    console.error(e);
  }
});

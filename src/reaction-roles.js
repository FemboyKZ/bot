const { Events } = require("discord.js");
const schema = require("./Schemas/reactionrole.js");
const { client } = require("./index.js");

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (!reaction || !reaction.message || !reaction.message.guildId || user.bot) {
    return;
  }

  let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
  if (!reaction.emoji.id) {
    cID = reaction.emoji.name;
  }
  const data = await schema.findOne({
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

  try {
    await member.roles.add(data.Role);
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

  const data = await schema.findOne({
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

  try {
    await member.roles.remove(data.Role);
  } catch (e) {
    console.error(e);
  }
});

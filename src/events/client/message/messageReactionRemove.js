const { Events } = require("discord.js");
const reactions = require("../../../schemas/reactionRoles.js");
//const requests = require("../../../schemas/request-status.js");

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction, user, details, client) {
    if (!reaction || !user || !client) {
      return;
    }

    if (user.partial) await user.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();

    let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
    if (!reaction.emoji.id) {
      cID = reaction.emoji.name;
    }
    const reactData = await reactions.findOne({
      Guild: reaction.message.guildId,
      Message: reaction.message.id,
      Emoji: cID,
    });
    if (reactData) {
      const guild = await client.guilds.cache.get(reaction.message.guildId);
      if (!guild) {
        return;
      }

      const member = await guild.members.cache.get(user.id);
      if (!member) {
        return;
      }

      try {
        await member.roles.remove(reactData.Role);
      } catch (e) {
        console.error(e);
      }
    }
  },
};

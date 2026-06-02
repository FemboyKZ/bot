const { Events } = require("discord.js");
const reactions = require("../../../schemas/reactionRoles.js");
const { emojiKey } = require("../../../utils/emoji.js");

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction, user, _details, client) {
    if (!reaction || !user || !client) return;
    if (user.bot) return;

    try {
      if (user.partial) await user.fetch();
      if (reaction.partial) await reaction.fetch();
      if (reaction.message.partial) await reaction.message.fetch();
    } catch {
      return; // reaction/message/user no longer available
    }

    if (!reaction.message.guildId) return;

    const cID = emojiKey(reaction.emoji);

    const reactData = await reactions.findOne({
      Guild: reaction.message.guildId,
      Message: reaction.message.id,
      Emoji: cID,
    });
    if (!reactData) return;

    const guild = client.guilds.cache.get(reaction.message.guildId);
    if (!guild) return;

    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    try {
      await member.roles.remove(reactData.Role);
    } catch (err) {
      console.error("Failed to remove reaction role:", err);
    }
  },
};

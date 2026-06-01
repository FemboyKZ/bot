const { Events } = require("discord.js");
const reactions = require("../../../schemas/reactionRoles.js");

module.exports = {
  name: Events.MessageReactionAdd,
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

    // Rebuild the stored emoji key; keep the `a:` prefix for animated emojis so
    // animated reaction roles match what the add command saved.
    const emoji = reaction.emoji;
    const cID = emoji.id
      ? `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`
      : emoji.name;

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
      await member.roles.add(reactData.Role);
    } catch (err) {
      console.error("Failed to add reaction role:", err);
    }
  },
};

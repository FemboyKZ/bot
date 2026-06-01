const { Events } = require("discord.js");
const antiLink = require("../../../schemas/moderation/antiLink.js");
//const antiSpam = require("../../../schemas/moderation/actionCounts.js");

// Matches http(s) urls, bare domains (example.com/...) and discord invites.
const LINK_REGEX =
  /(https?:\/\/|www\.|discord\.gg\/|discord\.com\/invite\/|\b[a-z0-9-]+\.[a-z]{2,}\b)/i;

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (
      !message ||
      !message.guild ||
      !message.author ||
      message.author.bot ||
      message.system ||
      message.webhookId ||
      !client
    ) {
      return;
    }

    const antiLinkData = await antiLink.findOne({
      Guild: message.guild.id,
    });
    if (antiLinkData && LINK_REGEX.test(message.content)) {
      try {
        const member =
          message.member ||
          (await message.guild.members
            .fetch(message.author.id)
            .catch(() => null));
        // Perms is a permission flag name e.g. "ManageGuild"; bail out if the
        // member holds it (or if it's missing/invalid so we don't throw).
        if (
          !member ||
          (antiLinkData.Perms && member.permissions.has(antiLinkData.Perms))
        ) {
          return;
        }
        const msg = await message.channel.send(
          `${message.author}, you can't send links here!`,
        );
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        await message.delete();
      } catch (error) {
        console.error(`Error in messageCreate event:\n${error}`);
      }
    }
  },
};

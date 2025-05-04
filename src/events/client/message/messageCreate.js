const { Events } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
//const antiSpam = require("../../../schemas/moderation/actionCounts.js");

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (
      !message ||
      !message.guild ||
      !message.author ||
      message.system ||
      message.webhookId ||
      !client
    ) {
      return;
    }

    const antiLinkData = await schema.findOne({
      Guild: message.guild.id,
      Type: "anti-link",
    });
    if (antiLinkData) {
      if (
        message.content.includes("http") ||
        message.content.includes("https") ||
        message.content.includes("gg/")
      ) {
        try {
          const member = await message.guild.members.cache.get(
            message.author.id,
          );
          if (member && member.permissions.has(antiLinkData.ByPass)) {
            return;
          } else if (member) {
            const msg = await message.channel.send(
              `${message.author}, you can't send links here!`,
            );
            setTimeout(() => msg.delete(), 3000);
            await message.delete();
          }
        } catch (error) {
          console.error(`Error in messageCreate event:\n${error}`);
        }
      }
    }
  },
};

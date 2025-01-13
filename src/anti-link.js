const { Events } = require("discord.js");
const schema = require("./Schemas/moderation/anti-link.js");
const { client } = require("./index.js");

client.on(Events.MessageCreate, async (message) => {
  if (
    message.content.includes("http") ||
    message.content.includes("https") ||
    message.content.includes("gg/")
  ) {
    try {
      const data = await schema.findOne({ Guild: message.guild.id });
      if (!data) return;

      const member = message.guild.members.cache.get(message.author.id);
      if (member && member.permissions.has(data.Perms)) {
        return;
      } else if (member) {
        const msg = await message.channel.send(
          `${message.author}, you can't send links here!`
        );
        setTimeout(() => msg.delete(), 3000);
        await message.delete();
      }
    } catch (error) {
      console.error(`Error in messageCreate event:\n${error}`);
    }
  }
});

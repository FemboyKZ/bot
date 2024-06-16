const { Events } = require("discord.js");
const linkSchema = require("./Schemas/linkSchema");
const { client } = require("./index.js");

client.on(Events.MessageCreate, async (message) => {
  if (
    message.content.startsWith("http") ||
    message.content.startsWith("discord.gg") ||
    message.content.includes("https://") ||
    message.content.includes("http://") ||
    message.content.includes("discord.gg/")
  ) {
    try {
      const Data = await linkSchema.findOne({ Guild: message.guild.id });

      if (!Data) return;

      const memberPerms = Data.Perms;
      const user = message.author;
      const member = message.guild.members.cache.get(user.id);

      if (member && member.permissions.has(memberPerms)) {
        return;
      } else if (member) {
        const sentMessage = await message.channel.send(
          `${message.author}, you can't send links here!`
        );
        setTimeout(() => sentMessage.delete(), 3000);
        await message.delete();
      }
    } catch (error) {
      console.error(`Error in messageCreate event:\n${error}`);
    }
  }
});

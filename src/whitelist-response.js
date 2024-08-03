const { PermissionFlagsBits, Events } = require("discord.js");
const whitelistStatusSchema = require("./Schemas/whitelistStatusSchema");
const { client } = require("./index.js");

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot || !reaction.message.guild) return;
  if (user.partial) await user.fetch();
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  const member = reaction.message.guild.members.cache.get(user.id);
  if (!member.permissions.has(PermissionFlagsBits.Administrator)) return;

  try {
    const data = await whitelistStatusSchema.findOne({
      Request: user.id,
    });
    if (!data) return;
    const guild = reaction.message.guild;
    const member = guild.members.cache.get(user.id);
    if (!member || !guild) return;
    const role = guild.roles.cache.find((role) => role.name === "Femmy");
    const oldRole = member.roles.cache.find(
      (role) => role.name === "Wannabe Fem"
    );
    if (reaction.emoji.name === "👍") {
      await whitelistStatusSchema.findOneAndUpdate(
        { Request: user.id },
        { Status: true }
      );
      if (!role) await member.roles.add(role);
      if (oldRole) await member.roles.remove(oldRole);
    } else if (reaction.emoji.name === "👎") {
      await whitelistStatusSchema.findOneAndUpdate(
        { Request: user.id },
        { Status: false }
      );
    } else {
      return;
    }
  } catch (error) {
    console.log(error);
  }
});

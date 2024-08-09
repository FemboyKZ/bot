const { PermissionFlagsBits, Events } = require("discord.js");
const schema = require("./Schemas/request-status.js");
const { client } = require("./index.js");

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot || !reaction.message.guild) return;
  if (user.partial) await user.fetch();
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  const member = reaction.message.guild.members.cache.get(user.id);
  if (!member.permissions.has(PermissionFlagsBits.Administrator)) return;

  try {
    const data = await schema.findOne({
      User: user.id,
      Type: "Whitelist",
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
      await schema.findOneAndUpdate(
        { User: user.id, Type: "Whitelist" },
        { Status: true }
      );
      if (!role) await member.roles.add(role);
      if (oldRole) await member.roles.remove(oldRole);
    } else if (reaction.emoji.name === "👎") {
      await schema.findOneAndUpdate(
        { User: user.id, Type: "Whitelist" },
        { Status: false }
      );
    } else {
      return;
    }
  } catch (error) {
    console.log(error);
  }
});

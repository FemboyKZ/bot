const { PermissionsBitField, Events } = require("discord.js");
const whitelistStatusSchema = require("./Schemas/whitelistStatusSchema");
const { client } = require("./index.js");

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;
  if (!user.PermissionsBitFields.has(PermissionsBitField.Flags.Administrator))
    return;
  const data = await whitelistStatusSchema.findOne({
    Request: user.id,
    Status: null,
  });
  if (!data) return;
  const guild = await client.guilds.fetch(data.Guild);
  const member = await guild.members.fetch(user.id);
  const role = guild.roles.cache.find((role) => role.name === "Femmy");
  const oldRole = member.roles.cache.find(
    (role) => role.name === "Wannabe Fem"
  );
  try {
    if (reaction.emoji.name === "👍") {
      await whitelistStatusSchema.findOneAndUpdate(
        { Request: user.id, Status: null },
        { Status: true }
      );
      await member.roles.add(role);
      await member.roles.remove(oldRole);
    } else if (reaction.emoji.name === ":thumbsdown:") {
      await whitelistStatusSchema.findOneAndUpdate(
        { Request: user.id, Status: null },
        { Status: false }
      );
    }
  } catch (error) {
    console.log(error);
  }
});

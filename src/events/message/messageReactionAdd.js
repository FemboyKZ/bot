const { PermissionFlagsBits, Events } = require("discord.js");
const reactions = require("../../Schemas/reactionrole.js");
const requests = require("../../Schemas/request-status.js");

module.exports = {
  name: Events.MessageReactionAdd,
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
        await member.roles.add(reactData.Role);
      } catch (e) {
        console.error(e);
      }
    }

    const requestData = await requests.findOne({
      User: user.id,
      Type: "Whitelist",
    });
    if (requestData) {
      const guild = reaction.message.guild;
      const newRole = await guild.roles.cache.find(
        (role) => role.name === "Femmy"
      );
      const oldRole = await member.roles.cache.find(
        (role) => role.name === "Wannabe Fem"
      );

      const member = await reaction.message.guild.members.cache.get(user.id);
      if (
        !member ||
        !member.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        return;
      }
      if (reaction.emoji.name === "👍") {
        await schema.findOneAndUpdate(
          { User: user.id, Type: "Whitelist" },
          { Status: true }
        );
        if (await member.roles.cache.has(newRole.id))
          await member.roles.add(newRole);
        if (await member.roles.cache.has(oldRole.id))
          await member.roles.remove(oldRole);
      } else if (reaction.emoji.name === "👎") {
        await schema.findOneAndUpdate(
          { User: user.id, Type: "Whitelist" },
          { Status: false }
        );
      } else {
        return;
      }
    }
  },
};

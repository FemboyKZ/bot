const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const reactions = require("../../Schemas/reactionrs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role-missing")
    .setDescription("[Admin] Add missing reaction roles to members"),

  async execute(interaction) {
    const guild = interaction.guild;
    const reactionsData = await reactions.find({ Guild: guild.id });

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: `You don't have perms to use this command.`,
        ephemeral: true,
      });

    for (const reactionData of reactionsData) {
      const message = await guild.channels.cache
        .get(reactionData.Channel)
        .messages.fetch(reactionData.Message);

      if (!message) {
        console.log(`Message not found for reaction: ${reactionData.Emoji}`);
        continue;
      }

      const reaction = message.reactions.cache.get(reactionData.Emoji);
      if (!reaction) {
        console.log(`Reaction not found: ${reactionData.Emoji}`);
        continue;
      }
      const role = guild.roles.cache.get(reactionData.Role);
      if (!role) {
        console.log(`Role not found: ${reactionData.Role}`);
        continue;
      }

      const membersWithRole = await reaction.users.fetch();
      const membersToAddRole = membersWithRole.filter(
        (member) => !member.roles.cache.has(role.id)
      );

      for (const member of membersToAddRole.values()) {
        await member.roles.add(role);
      }
    }

    const membersWithExtraRoles = guild.members.cache.filter(
      (member) =>
        !member.user.bot &&
        !member.roles.cache.has(guild.id) &&
        !reactionsData.some((data) => member.roles.cache.has(data.Role))
    );

    for (const member of membersWithExtraRoles.values()) {
      const rolesToRemove = member.roles.cache.filter(
        (role) =>
          !role.managed &&
          role.id !== guild.id &&
          !reactionsData.some((data) => role.id === data.Role)
      );

      for (const role of rolesToRemove.values()) {
        await member.roles.remove(role);
      }
    }

    await interaction.reply({
      content: "Added missing roles to members and removed extra roles.",
      ephemeral: true,
    });
  },
};

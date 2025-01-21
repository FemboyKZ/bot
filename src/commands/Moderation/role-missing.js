const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const schema = require("../../schemas/reactionrole.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role-missing")
    .setDescription("[Admin] Add missing reaction roles to members")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const guild = interaction.guild;
      if (!guild) {
        throw new Error("Interaction is not in a guild");
      }

      if (
        !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        return await interaction.reply({
          content: `You don't have perms to use this command.`,
          ephemeral: true,
        });
      }

      const reactionsData = await schema.find({ Guild: guild.id });
      if (!reactionsData) {
        throw new Error("No reaction data found");
      }

      for (const reactionData of reactionsData) {
        const channel = guild.channels.cache.get(reactionData.Channel);
        if (!channel) {
          console.log(`Channel not found for reaction: ${reactionData.Emoji}`);
          continue;
        }

        const message = await channel.messages.fetch(reactionData.Message);
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
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "An error occurred while executing this command.",
        ephemeral: true,
      });
    }
  },
};

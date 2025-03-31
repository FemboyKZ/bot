const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const schema = require("../../schemas/moderation/muteRoles.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-mute-role")
    .setDescription("[Admin] Set or update the mute role")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("Select the role")
        .setRequired(true),
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "You don't have permissions to use this command.",
        ephemeral: true,
      });
    }

    try {
      const guild = interaction.guild;
      const role = interaction.options.getString("role");

      if (!role) {
        return interaction.reply({
          content: "Please provide a role to set.",
          ephemeral: true,
        });
      }

      const operations = [];
      if (role) {
        operations.push(
          schema.findOneAndUpdate(
            { Guild: guild.id },
            { $set: { Role: role } },
            { upsert: true, new: true },
          ),
        );
      }

      await Promise.all(operations);

      return interaction.reply({
        content: "Roles have been successfully updated!",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error in set-mute-role:", error);
      return interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};

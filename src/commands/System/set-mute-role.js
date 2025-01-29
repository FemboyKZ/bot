const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const schema = require("../../schemas/moderation/muteRoles.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-mute-role")
    .setDescription("[Admin] Set or change the mute role")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("Set or update the Mute Role")
        .setRequired(true),
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }

    const roleId = interaction.options.getString("role");
    const role = await interaction.guild.roles.cache.get(roleId);
    const data = await schema.findOne({ Guild: interaction.guild.id });

    if (!role) {
      return await interaction.reply({
        content: `The role ${roleId} does not exist.`,
        ephemeral: true,
      });
    }

    try {
      if (!data) {
        if (roleId) {
          await schema.create({
            Guild: interaction.guild.id,
            Role: roleId,
          });
          return await interaction.reply({
            content: "Roles have been set.",
            ephemeral: true,
          });
        } else {
          return await interaction.reply({
            content: `No role has been set.`,
            ephemeral: true,
          });
        }
      }
      if (data) {
        if (role.id === data.Role) {
          return await interaction.reply({
            content: `The role is already set to ${role}.`,
            ephemeral: true,
          });
        }
        if (roleId) {
          await schema.findOneAndUpdate(
            {
              Guild: interaction.guild.id,
            },
            {
              Role: roleId,
            },
          );
          return await interaction.reply({
            content: `Roles have been updated.`,
            ephemeral: true,
          });
        } else {
          return await interaction.reply({
            content: `Roles have not been updated.`,
            ephemeral: true,
          });
        }
      }
    } catch (err) {
      console.error("Error executing command:", err);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};

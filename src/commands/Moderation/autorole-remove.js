const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const autorole = require("../../Schemas/autorole");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autorole-remove")
    .setDescription("[Admin] Remove a role from the autoroles")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The Role you want to remove from the Autoroles")
        .setRequired(true)
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

    const roleOptions = ["role"];
    const roles = roleOptions
      .map((roleOption) => interaction.options.getRole(roleOption))
      .filter((role) => role !== null);

    if (roles.length === 0) {
      return await interaction.reply({
        content: "No valid roles provided.",
        ephemeral: true,
      });
    }

    const roleIds = roles.map((role) => role.id);

    await autorole.updateOne(
      { Guild: interaction.guild.id },
      { $pull: { Roles: { $each: roleIds } } },
      { upsert: true }
    );

    const roleNames = roles.map((role) => role.name).join(", ");
    const removed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(
        `The role ${roleNames} has been removed from the autoroles`
      );

    await interaction.reply({ embeds: [removed], ephemeral: true });
  },
};

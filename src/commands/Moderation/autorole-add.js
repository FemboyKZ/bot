const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const schema = require("../../schemas/autorole.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autorole-add")
    .setDescription("[Admin] Set the autoroles for this Server!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The Role you want to set for the Autoroles")
        .setRequired(true)
    ),
  async execute(interaction) {
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

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }

    const roleIds = roles.map((role) => role.id);

    await schema.updateOne(
      { Guild: interaction.guild.id },
      { $push: { Roles: { $each: roleIds } } },
      { upsert: true }
    );

    const roleNames = roles.map((role) => role.name).join(", ");
    const set = new EmbedBuilder()
      .setColor("Green")
      .setDescription(
        `You have added the roles: ${roleNames}, to the autoroles.`
      );

    await interaction.reply({ embeds: [set], ephemeral: true });
  },
};

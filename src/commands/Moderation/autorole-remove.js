const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const autorole = require("../../Schemas/autorole");

const noperms = new EmbedBuilder()
  .setColor("Red")
  .setDescription("You need to have Admin to use this command!");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autorole-remove")
    .setDescription("[Admin] Remove a role from the autoroles"),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({ embeds: [noperms], ephemeral: true });

    const role = interaction.options.getRole("role", true);

    await autorole.updateOne(
      { Guild: interaction.guild.id },
      { $pull: { Roles: role.id } },
      { upsert: true }
    );

    const removed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(
        `The role ${role.name} has been removed from the autoroles`
      );

    await interaction.reply({ embeds: [removed], ephemeral: true });
  },
};

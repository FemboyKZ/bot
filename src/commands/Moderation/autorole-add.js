const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const autorole = require("../../Schemas/autorole");

const already = new EmbedBuilder()
  .setColor("#ff00b3")
  .setDescription("You already have a autorole setup!");

const noperms = new EmbedBuilder()
  .setColor("#ff00b3")
  .setDescription("You need to have Admin to use this command!");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autorole-add")
    .setDescription("[Admin] Set the autoroles for this Server!")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The Role you want to set for the Autoroles")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async execute(interaction) {
    const roles = interaction.options.getRole("role", true);

    const set = new EmbedBuilder()
      .setColor("Green")
      .setDescription(
        `The Autoroles have been set to ${roles
          .map((role) => role.name)
          .join(", ")}`
      );

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({ embeds: [noperms], ephemeral: true });

    const roleIds = roles.map((role) => role.id);

    await autorole.updateOne(
      { Guild: interaction.guild.id },
      { $set: { Roles: roleIds } },
      { upsert: true }
    );

    await interaction.reply({ embeds: [set], ephemeral: true });
  },
};

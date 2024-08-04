const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const autorole = require("../../Schemas/autorole");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autorole-list")
    .setDescription("[Admin] List all autoroles")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }

    const autoroleData = await autorole.findOne({
      Guild: interaction.guild.id,
    });
    const autoroles = autoroleData ? autoroleData.Roles : [];

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("Autoroles")
      .setDescription(
        autoroles.map((role) => `<@&${role}>`).join("\n") || "None"
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

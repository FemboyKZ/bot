const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const reportSchema = require("../../Schemas/reportSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report-disable")
    .setDescription("[Admin] Disable the report/suggestions system"),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { guildId } = interaction;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setDescription(`The unban system has been disabled.`);

    try {
      reportSchema.deleteMany({ Guild: guildId });

      return await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error("Error executing command:", err);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};

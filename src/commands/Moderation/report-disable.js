const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const reportSchema = require("../../Schemas.js/reportSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report-disable")
    .setDescription("[Admin] Disable the report/suggestions system"),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { guildId } = interaction;

    const embed = new EmbedBuilder();

    reportSchema.deleteMany({ Guild: guildId }, async (err, data) => {
      embed
        .setColor("#ff00b3")
        .setDescription(`The unban system has been disabled.`);

      return await interaction.reply({ embeds: [embed] });
    });
  },
};

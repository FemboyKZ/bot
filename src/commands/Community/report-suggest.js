const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const reportSchema = require("../../Schemas.js/reportSchema");

var timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report-or-suggest")
    .setDescription("Report an issue, or suggest an idea/improvement."),
  async execute(interaction) {
    if (timeout.includes(interaction.user.id))
      return await interaction.reply({
        content: `You are on a cooldown! Try again in a few seconds.`,
        ephemeral: true,
      });

    reportSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
      if (!data) {
        return await interaction.reply({
          content: "The reports/suggestions are currently disabled.",
          ephemeral: true,
        });
      }

      if (data) {
        const modal3 = new ModalBuilder()
          .setTitle("Report/Suggestion form")
          .setCustomId("modal3");

        const issue3 = new TextInputBuilder()
          .setCustomId("issue3")
          .setRequired(true)
          .setLabel("What do you want to report/suggest")
          .setPlaceholder("A cheater? New server? Etc.")
          .setStyle(TextInputStyle.Short);

        const info3 = new TextInputBuilder()
          .setCustomId("info3")
          .setRequired(true)
          .setLabel("Explain what/who you're suggesting/reporting.")
          .setPlaceholder(
            "What happened? Where? / What makes your suggestion worth adding."
          )
          .setStyle(TextInputStyle.Paragraph);

        const more3 = new TextInputBuilder()
          .setCustomId("more3")
          .setRequired(true)
          .setLabel("Anything to add?")
          .setPlaceholder("Links to images/videos for proof/concepts? Etc.")
          .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder().addComponents(issue3);
        const secondActionRow = new ActionRowBuilder().addComponents(info3);
        const thirdActionRow = new ActionRowBuilder().addComponents(more3);

        modal3.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        interaction.showModal(modal3);
      }
    });

    timeout.push(interaction.user.id);
    setTimeout(() => {
      timeout.shift();
    }, 10000);
  },
};

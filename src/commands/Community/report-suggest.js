import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import reportSchema from "../../Schemas.js/reportSchema";

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
        const modalReport = new ModalBuilder()
          .setTitle("Report/Suggestion form")
          .setCustomId("modalReport");

        const issueReport = new TextInputBuilder()
          .setCustomId("issueReport")
          .setRequired(true)
          .setLabel("What do you want to report/suggest")
          .setPlaceholder("A cheater? New server? Etc.")
          .setStyle(TextInputStyle.Short);

        const infoReport = new TextInputBuilder()
          .setCustomId("infoReport")
          .setRequired(true)
          .setLabel("Explain what/who you're suggesting/reporting.")
          .setPlaceholder(
            "What happened? Where? / What makes your suggestion worth adding."
          )
          .setStyle(TextInputStyle.Paragraph);

        const moreReport = new TextInputBuilder()
          .setCustomId("moreReport")
          .setRequired(true)
          .setLabel("Anything to add?")
          .setPlaceholder("Links to images/videos for proof/concepts? Etc.")
          .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder().addComponents(
          issueReport
        );
        const secondActionRow = new ActionRowBuilder().addComponents(
          infoReport
        );
        const thirdActionRow = new ActionRowBuilder().addComponents(moreReport);

        modalReport.addComponents(
          firstActionRow,
          secondActionRow,
          thirdActionRow
        );

        interaction.showModal(modalReport);
      }
    });

    timeout.push(interaction.user.id);
    setTimeout(() => {
      timeout.shift();
    }, 10000);
  },
};

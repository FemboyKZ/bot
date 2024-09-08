const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const schema = require("../../Schemas/base-system.js");

var timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report-or-suggest")
    .setDescription("Report an issue, or suggest an idea/improvement."),
  async execute(interaction) {
    if (!interaction || !interaction.user || !interaction.guild) {
      return;
    }

    if (timeout.includes(interaction.user.id)) {
      return await interaction.reply({
        content: `You are on a cooldown! Try again in a few seconds.`,
        ephemeral: true,
      });
    }

    const data = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "report",
    });

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

    const firstActionRow = new ActionRowBuilder().addComponents(issueReport);
    const secondActionRow = new ActionRowBuilder().addComponents(infoReport);
    const thirdActionRow = new ActionRowBuilder().addComponents(moreReport);

    modalReport.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    try {
      if (!data) {
        return await interaction.reply({
          content: "The reports/suggestions are currently disabled.",
          ephemeral: true,
        });
      }

      await interaction.showModal(modalReport);
      timeout.push(interaction.user.id);
      setTimeout(() => {
        timeout.shift();
      }, 10000);
    } catch (error) {
      console.error(`Failed to execute report-or-suggest command: ${error}`);
      await interaction.reply({
        content: `An error occurred while executing the command. Please try again later.`,
        ephemeral: true,
      });
    }
  },
};

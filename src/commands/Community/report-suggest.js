const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags,
} = require("discord.js");
const schema = require("../../schemas/baseSystem.js");

var timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report-or-suggest")
    .setDescription("Report an issue, or suggest an idea/improvement."),
  async execute(interaction) {
    if (!interaction || !interaction.user || !interaction.guild) {
      return;
    }

    if (timeout.includes(interaction.user.id))
      return await interaction.reply({
        content: `You are on a cooldown! Try again in a few seconds.`,
        flags: MessageFlags.Ephemeral,
      });

    const data = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "report",
    });

    const issueReport = new TextInputBuilder({
      customId: "issueReport",
      required: true,
      label: "What do you want to report/suggest",
      placeholder: "A cheater? New server? Etc.",
      style: TextInputStyle.Short,
    });

    const infoReport = new TextInputBuilder({
      customId: " infoReport",
      required: true,
      label: "Explain what/who you're suggesting/reporting.",
      placeholder:
        "What happened? Where? / What makes your suggestion worth adding.",
      style: TextInputStyle.Paragraph,
    });

    const moreReport = new TextInputBuilder({
      customId: "moreReport",
      required: true,
      label: "Anything to add?",
      placeholder: "Links to images/videos for proof/concepts? Etc.",
      style: TextInputStyle.Short,
    });

    const modalReport = new ModalBuilder({
      customId: "modalReport",
      title: "Report/Suggestion form",
      components: [
        new ActionRowBuilder({ components: [issueReport] }),
        new ActionRowBuilder({ components: [infoReport] }),
        new ActionRowBuilder({ components: [moreReport] }),
      ],
    });

    try {
      if (!data) {
        return await interaction.reply({
          content: "The reports/suggestions are currently disabled.",
          flags: MessageFlags.Ephemeral,
        });
      }

      await interaction.showModal(modalReport);
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: "An error occurred while processing your request.",
        flags: MessageFlags.Ephemeral,
      });
    } finally {
      timeout.push(interaction.user.id);
      setTimeout(() => {
        timeout.shift();
      }, 10000);
    }
  },
};

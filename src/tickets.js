const {
  Events,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { client } = require("./index.js");

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isStringSelectMenu() || !interaction.isModalSubmit()) {
    return;
  }

  const modalTicket = new ModalBuilder()
    .setTitle("Provide us with more information")
    .setCustomId("modalTicket");

  const topicTicket = new TextInputBuilder()
    .setCustomId("topicTicket")
    .setRequired(true)
    .setLabel("What is the topic of your ticket?")
    .setPlaceholder("Server connection issue? Server crashed. Etc.")
    .setStyle(TextInputStyle.Short);

  const infoTicket = new TextInputBuilder()
    .setCustomId("infoTicket")
    .setRequired(true)
    .setLabel("Specify the issue, in detail.")
    .setPlaceholder(
      "Error messages? What happened? What have you tried already to fix it? Etc."
    )
    .setStyle(TextInputStyle.Paragraph);

  const additionalTicket = new TextInputBuilder()
    .setCustomId("additionalTicket")
    .setRequired(true)
    .setLabel("Anything to add? Links/Clips/Screenshots/etc.")
    .setPlaceholder("Links to Clips/Screenshots. Server IP/Name.")
    .setStyle(TextInputStyle.Paragraph);

  const firstActionRow = new ActionRowBuilder().addComponents(topicTicket);
  const secondActionRow = new ActionRowBuilder().addComponents(infoTicket);
  const thirdActionRow = new ActionRowBuilder().addComponents(additionalTicket);

  modalTicket.addComponents(firstActionRow, secondActionRow, thirdActionRow);

  try {
    await interaction.showModal(modalTicket);
  } catch (error) {
    console.error(error);
  }
});

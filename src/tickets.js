const {
  EmbedBuilder,
  PermissionsBitField,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
} = require("discord.js");
const system = require("./Schemas/base-system.js");
const { client } = require("./index.js");

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) return;
  if (interaction.isChatInputCommand()) return;

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

  if (interaction.isStringSelectMenu()) {
    if (!interaction.isModalSubmit()) {
      interaction.showModal(modalTicket);
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return await interaction.reply({
        content: `You don't have perms to use this command.`,
        ephemeral: true,
      });
    }
    if (interaction.customId === "ticket-close") {
      await interaction.reply({
        content: `Ticket closed.`,
        ephemeral: true,
      });
      await interaction.message.delete();
    }
  }
});

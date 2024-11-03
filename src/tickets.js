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
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "modalTicket") {
      const data = await system.findOne({
        Guild: interaction.guild.id,
        Type: "tickets",
      });
      if (!data) return;

      const topicInput = interaction.fields.getTextInputValue("topicTicket");
      const infoInput = interaction.fields.getTextInputValue("infoTicket");
      const additionalInput =
        interaction.fields.getTextInputValue("additionalTicket");

      if (infoInput.length > 500 || additionalInput.length > 500) {
        return await interaction.reply({
          content: `You have entered too much text, please shorten it and try again.`,
          ephemeral: true,
        });
      }

      const posChannel = await interaction.guild.channels.cache.find(
        (c) => c.name === `ticket-${interaction.user.id}`
      );
      if (posChannel)
        return await interaction.reply({
          content: `You already have an open ticket - ${posChannel}`,
          ephemeral: true,
        });

      const category = data.Channel;

      if (!category) {
        return await interaction.reply({
          content: `Tickets are currently disabled, please try again later.`,
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTitle(`${interaction.user.username}'s Ticket`)
        .setDescription(
          `Thank you for opening a ticket. Please wait while the staff reviews your information. We will respond to you shortly.`
        )
        .addFields([
          {
            name: `Topic`,
            value: `${topicInput}`,
            inline: false,
          },
          {
            name: `Info`,
            value: `${infoInput}`,
            inline: false,
          },
          {
            name: `Additional Info`,
            value: `${additionalInput}`,
            inline: false,
          },
          {
            name: `Type`,
            value: `${data.Ticket}`,
            inline: false,
          },
        ])
        .setFooter({ text: `${interaction.guild.name} Tickets` })
        .setTimestamp()
        .setImage("https://femboy.kz/images/wide.png");

      const buttonClose = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket-close")
          .setLabel("Close ticket")
          .setStyle(ButtonStyle.Danger)
      );

      let channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.id}`,
        type: ChannelType.GuildText,
        parent: `${category}`,
      });

      await channel.send({
        embeds: [embed],
        components: [buttonClose],
      });
      await interaction.reply({
        content: `You have opened a ticket: ${channel}`,
        ephemeral: true,
      });

      const member = interaction.user.id;
      await channel.permissionOverwrites.edit(member, {
        SendMessages: true,
        ViewChannel: true,
      });
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

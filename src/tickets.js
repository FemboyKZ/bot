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
const ticketSchema = require("./Schemas/ticketSchema");
const { client } = require(".");

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

  let choices;
  if (interaction.isStringSelectMenu()) {
    choices = interaction.values;

    const result = choices.join("");

    ticketSchema.findOne({ Guild: interaction.guild.id }).then((data) => {
      if (!data) return;
      const filter = { Guild: interaction.guild.id };
      const update = { Ticket: result };

      ticketSchema
        .updateOne(filter, update, {
          new: true,
        })
        .then((value) => {
          console.log(value);
        });
    });

    if (!interaction.isModalSubmit()) {
      interaction.showModal(modalTicket);
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "modalTicket") {
      ticketSchema
        .findOne({ Guild: interaction.guild.id })
        .then(async (data) => {
          if (!data) return;
          const topicInput =
            interaction.fields.getTextInputValue("topicTicket");
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

          let msg = await channel.send({
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

          const collector = msg.createMessageComponentCollector();

          collector.on("collect", async (i) => {
            if (
              !i.member.permissions.has(PermissionsBitField.Flags.Administrator)
            )
              return await interaction.reply({
                content: "You don't have perms to use this command.",
                ephemeral: true,
              });

            await channel.delete();
          });
        });
    }
  }
});

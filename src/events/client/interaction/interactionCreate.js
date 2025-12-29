const {
  PermissionsBitField,
  EmbedBuilder,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const schema = require("../../../schemas/baseSystem.js");
const status = require("../../../schemas/requestStatus.js");
const {
  isValidMinecraftUUID,
  isValidSteamID,
  ConvertSteamIDTo64,
} = require("../../../utils/validators.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction || !client) {
      return;
    }

    /*
    const { cooldowns } = interaction.client;
    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        return interaction.reply({
          content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          ephemeral: true,
        });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    */

    /*
    if (interaction.isAnySelectMenu()) {
    }

    if (interaction.isAutoComplete()) {
    }
    */

    if (interaction.isButton()) {
      if (interaction.customId === "ticket-close") {
        try {
          if (
            !interaction.member.permissions.has(
              PermissionsBitField.Flags.Administrator,
            )
          ) {
            return await interaction.reply({
              content: `You don't have perms to use this command.`,
              ephemeral: true,
            });
          }
          await interaction.reply({
            content: `Ticket closed.`,
            ephemeral: true,
          });
          await interaction.message.delete();
          await interaction.channel.delete();
        } catch (error) {
          console.error("Error closing ticket:", error);
          await interaction.reply({
            content: "There was an error while closing the ticket.",
            ephemeral: true,
          });
        }
      }
      if (interaction.customId === "accept-request") {
        try {
          if (
            !interaction.member.permissions.has(
              PermissionsBitField.Flags.Administrator,
            )
          ) {
            return await interaction.reply({
              content: `You don't have perms to use this command.`,
              ephemeral: true,
            });
          }
          const data = await status.findOne({
            Message: interaction.message.id,
          });
          if (!data) {
            return await interaction.reply({
              content: `No pending request found for this user.`,
              ephemeral: true,
            });
          }
          await status.findOneAndUpdate(
            { Message: interaction.message.id },
            { Status: true },
          );
          await interaction.reply({
            content: `Request accepted.`,
            ephemeral: true,
          });
          await interaction.message.edit({
            content: `**REQUEST ACCEPTED**`,
            components: [],
          });
        } catch (error) {
          console.error("Error accepting request:", error);
          await interaction.reply({
            content: "There was an error while accepting the request.",
            ephemeral: true,
          });
        }
      }
      if (interaction.customId === "deny-request") {
        try {
          if (
            !interaction.member.permissions.has(
              PermissionsBitField.Flags.Administrator,
            )
          ) {
            return await interaction.reply({
              content: `You don't have perms to use this command.`,
              ephemeral: true,
            });
          }
          const data = await status.findOne({
            Message: interaction.message.id,
          });
          if (!data) {
            return await interaction.reply({
              content: `No pending request found for this user.`,
              ephemeral: true,
            });
          }
          await status.findOneAndUpdate(
            { Message: interaction.message.id },
            { Status: false },
          );
          await interaction.reply({
            content: `Request denied.`,
            ephemeral: true,
          });
          await interaction.message.edit({
            content: `**REQUEST DENIED**`,
            components: [],
          });
        } catch (error) {
          console.error("Error denying request:", error);
          await interaction.reply({
            content: "There was an error while denying the request.",
            ephemeral: true,
          });
        }
      }
    }

    /*
    if (interaction.isChannelSelectMenu()) {
    }

    if (interaction.isChatInputCommand()) {
    }
    */

    if (interaction.isCommand()) {
      const command = await client.commands.get(interaction.commandName);
      if (!command) {
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error("Error executing command:", error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }
    }

    /*
    if (interaction.isContextMenuCommand()) {
    }

    if (interaction.isFromMessage()) {
    }

    if (interaction.isMentionableSelectMenu()) {
    }
    
    if (interaction.isMessageComponent()) {
    }

    if (interaction.isMessageContextMenuCommand()) {
    }
    */

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "modalMc") {
        const uuid = interaction.fields.getTextInputValue("uuidMc");
        const reason = interaction.fields.getTextInputValue("reasonMc");
        const request = interaction.fields.getTextInputValue("requestMc");

        if (!isValidMinecraftUUID(uuid)) {
          return await interaction.reply({
            content: `The provided UUID is not valid. Please provide a valid Minecraft UUID.`,
            ephemeral: true,
          });
        }

        if (reason.length > 500 || request.length > 500) {
          return await interaction.reply({
            content: `You have entered too much text, please shorten it and try again.`,
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setColor("#ff00b3")
          .setTitle("New Whitelist Request")
          .setImage("https://femboy.kz/images/wide.png")
          .setDescription(
            `Requesting member: ${interaction.user.tag} (${interaction.user.id})\nIn Server: ${interaction.guild.name} (${interaction.guild.id})`,
          )
          .addFields(
            {
              name: "Name / UUID",
              value: `${uuid}`,
              inline: false,
            },
            {
              name: "Reasoning for whitelist",
              value: `${reason}`,
              inline: false,
            },
            {
              name: "What they want to do on the server",
              value: `${request}`,
              inline: false,
            },
          )
          .setTimestamp();

        const buttonAccept = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("accept-request")
            .setLabel("Accept Request")
            .setStyle(ButtonStyle.Success),
        );

        const buttonDeny = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("deny-request")
            .setLabel("Deny Request")
            .setStyle(ButtonStyle.Danger),
        );

        const data = await schema.findOne({
          Guild: interaction.guild.id,
          ID: "mc-whitelist",
        });
        if (!data || !data.Channel) return;
        const channel = await interaction.guild.channels.cache.get(
          data.Channel,
        );
        if (!channel) return;

        try {
          const msg = await channel.send({
            embeds: [embed],
            components: [buttonAccept, buttonDeny],
          });
          await interaction.reply({
            content: "Your request has been submitted.",
            ephemeral: true,
          });
          await status.create({
            User: interaction.user.id,
            Type: "mc-whitelist",
            Message: msg?.id,
            Status: null,
          });
        } catch (error) {
          console.error("Error submitting modal:", error);
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }

      if (interaction.customId === "modalWhitelist") {
        const steam = interaction.fields.getTextInputValue("steamWhitelist");
        const reason = interaction.fields.getTextInputValue("reasonWhitelist");
        const request =
          interaction.fields.getTextInputValue("requestWhitelist");

        if (isValidSteamID(steam) === false) {
          return await interaction.reply({
            content: `Please enter a valid SteamID or Profile URL`,
            ephemeral: true,
          });
        }
        if (isValidSteamID(steam) === "custom_id") {
          return await interaction.reply({
            content: `Please enter a valid SteamID or Profile URL, not a custom URL.`,
            ephemeral: true,
          });
        }

        if (reason.length > 500 || request.length > 500) {
          return await interaction.reply({
            content: `You have entered too much text, please shorten it and try again.`,
            ephemeral: true,
          });
        }

        if (
          !request.toLowerCase().includes("yes") &&
          !request.toLowerCase().includes("no")
        ) {
          return await interaction.reply({
            content: `Please specify if you have requested to join the group with a simple "yes" or "no".`,
            ephemeral: true,
          });
        }

        if (request.toLowerCase().includes("no")) {
          return await interaction.reply({
            content: `Not requesting to the group will get you automatically denied.\nIf you want to request without joining the group, please create a ticket instead.`,
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setColor("#ff00b3")
          .setTitle("New Whitelist Request")
          .setImage("https://femboy.kz/images/wide.png")
          .setDescription(
            `Requesting member: ${interaction.user.tag} (${interaction.user.id})\nIn Server: ${interaction.guild.name} (${interaction.guild.id})`,
          )
          .addFields(
            {
              name: "SteamID / Profile URL",
              value: `${await ConvertSteamIDTo64(steam)}`,
              inline: false,
            },
            {
              name: "Reasoning for whitelist",
              value: `${reason}`,
              inline: false,
            },
            {
              name: "Requested to Group? Yes/No",
              value: `${request}`,
              inline: false,
            },
          )
          .setTimestamp();

        const buttonAccept = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("accept-request")
            .setLabel("Accept Request")
            .setStyle(ButtonStyle.Success),
        );

        const buttonDeny = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("deny-request")
            .setLabel("Deny Request")
            .setStyle(ButtonStyle.Danger),
        );

        const data = await schema.findOne({
          Guild: interaction.guild.id,
          ID: "whitelist",
        });
        if (!data || !data.Channel) return;
        const channel = await interaction.guild.channels.cache.get(
          data.Channel,
        );
        if (!channel) return;

        try {
          const msg = await channel.send({
            embeds: [embed],
            components: [buttonAccept, buttonDeny],
          });
          await interaction.reply({
            content: "Your request has been submitted.",
            ephemeral: true,
          });
          await status.create({
            User: interaction.user.id,
            Type: "whitelist",
            Message: msg?.id,
            Status: null,
          });
        } catch (error) {
          console.error("Error submitting modal:", error);
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }

      if (interaction.customId === "modalUnban") {
        const steam = interaction.fields.getTextInputValue("steamUnban");
        const reason = interaction.fields.getTextInputValue("reasonUnban");
        const server = interaction.fields.getTextInputValue("serverUnban");

        if (isValidSteamID(steam) === false) {
          return await interaction.reply({
            content: `Please enter a valid SteamID or Profile URL`,
            ephemeral: true,
          });
        }
        if (isValidSteamID(steam) === "custom_id") {
          return await interaction.reply({
            content: `Please enter a valid SteamID or Profile URL, not a custom URL.`,
            ephemeral: true,
          });
        }

        if (reason.length > 500) {
          return await interaction.reply({
            content: `You have entered too much text, please shorten it and try again.`,
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setColor("#ff00b3")
          .setTitle("New Unban Request")
          .setImage("https://femboy.kz/images/wide.png")
          .setDescription(
            `Requesting member: ${interaction.user.tag} (${interaction.user.id})\nIn Server: ${interaction.guild.name} (${interaction.guild.id})`,
          )
          .addFields(
            {
              name: "SteamID / Profile URL",
              value: `${steam}`,
              inline: false,
            },
            {
              name: "Reasoning for unban",
              value: `${reason}`,
              inline: false,
            },
            {
              name: "Server IP/Name",
              value: `${server}`,
              inline: false,
            },
          )
          .setTimestamp();

        const buttonAccept = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("accept-request")
            .setLabel("Accept Request")
            .setStyle(ButtonStyle.Success),
        );

        const buttonDeny = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("deny-request")
            .setLabel("Deny Request")
            .setStyle(ButtonStyle.Danger),
        );

        const data = await schema.findOne({
          Guild: interaction.guild.id,
          ID: "unban",
        });
        if (!data || !data.Channel) return;
        const channel = await interaction.guild.channels.cache.get(
          data.Channel,
        );
        if (!channel) return;

        try {
          const msg = await channel.send({
            embeds: [embed],
            components: [buttonAccept, buttonDeny],
          });
          await interaction.reply({
            content: "Your request has been submitted.",
            ephemeral: true,
          });
          await status.create({
            User: interaction.user.id,
            Type: "unban",
            Message: msg?.id,
            Status: null,
          });
        } catch (error) {
          console.error("Error submitting modal:", error);
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }

      if (interaction.customId === "modalReport") {
        const issue = interaction.fields.getTextInputValue("issueReport");
        const info = interaction.fields.getTextInputValue("infoReport");
        const more = interaction.fields.getTextInputValue("moreReport");

        if (info.length > 500 || more.length > 500) {
          return await interaction.reply({
            content: `You have entered too much text, please shorten it and try again.`,
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("New Report/Suggestion Request")
          .setImage("https://femboy.kz/images/wide.png")
          .setDescription(
            `Requesting member: ${interaction.user.tag} (${interaction.user.id})\nIn Server: ${interaction.guild.name} (${interaction.guild.id})`,
          )
          .addFields(
            {
              name: "Reported issue / Suggestion",
              value: `${issue}`,
              inline: false,
            },
            {
              name: "Issue/Suggestion in detail",
              value: `${info}`,
              inline: false,
            },
            {
              name: "More info, such as links.",
              value: `${more}`,
              inline: false,
            },
          )
          .setTimestamp();

        const data = await schema.findOne({
          Guild: interaction.guild.id,
          ID: "report",
        });
        if (!data || !data.Channel) return;
        const channel = await interaction.guild.channels.cache.get(
          data.Channel,
        );
        if (!channel) return;

        try {
          await channel.send({ embeds: [embed] });
          await interaction.reply({
            content: "Your request has been submitted.",
            ephemeral: true,
          });
          await status.create({
            User: interaction.user.id,
            Type: "report",
            Status: null,
          });
        } catch (error) {
          console.error("Error submitting modal:", error);
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }

      if (interaction.customId === "ticket-modal") {
        const data = await schema.findOne({
          Guild: interaction.guild.id,
          ID: "tickets",
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
          (c) => c.name === `ticket-${interaction.user.id}`,
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
            `Thank you for opening a ticket. Please wait while the staff reviews your information. We will respond to you shortly.`,
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
          ])
          .setFooter({ text: `${interaction.guild.name} Tickets` })
          .setTimestamp()
          .setImage("https://femboy.kz/images/wide.png");

        const buttonClose = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket-close")
            .setLabel("Close ticket")
            .setStyle(ButtonStyle.Danger),
        );

        let channel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.id}`,
          type: ChannelType.GuildText,
          parent: `${category}`,
        });

        try {
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
        } catch (error) {
          console.error("Error submitting modal:", error);
        }
      }
    }

    /*
    if (interaction.isRepliable()) {
    }

    if (interaction.isRoleSelectMenu()) {
    }
    */

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "ticket-open") {
        const modalTicket = new ModalBuilder()
          .setTitle("Provide us with more information")
          .setCustomId("ticket-modal");

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
            "Error messages? What happened? What have you tried already to fix it? Etc.",
          )
          .setStyle(TextInputStyle.Paragraph);

        const additionalTicket = new TextInputBuilder()
          .setCustomId("additionalTicket")
          .setRequired(true)
          .setLabel("Anything to add? Links/Clips/Screenshots/etc.")
          .setPlaceholder("Links to Clips/Screenshots. Server IP/Name.")
          .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder().addComponents(
          topicTicket,
        );
        const secondActionRow = new ActionRowBuilder().addComponents(
          infoTicket,
        );
        const thirdActionRow = new ActionRowBuilder().addComponents(
          additionalTicket,
        );

        modalTicket.addComponents(
          firstActionRow,
          secondActionRow,
          thirdActionRow,
        );

        try {
          await interaction.showModal(modalTicket);
        } catch (error) {
          console.error(error);
        }
      }
    }

    /*
    if (interaction.isUserContextMenuCommand()) {
    }

    if (interaction.isUserSelectMenu()) {
    }
    */

    const auditlogData = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "audit-logs",
    });

    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("Interaction Execution Logged.")
      .setFooter({ text: `FKZ` })
      .setTimestamp()
      .addFields([
        {
          name: "User",
          value: `<@${interaction.user.id}> - ${interaction.user.username}`,
          inline: false,
        },
        {
          name: "Interaction Type",
          value: `${interaction.type}`,
          inline: false,
        },
      ]);

    if (interaction.customId) {
      embed.addFields({
        name: "Custom ID",
        value: `\`${interaction.customId}\``,
        inline: false,
      });
    }

    if (interaction.commandName) {
      embed.addFields({
        name: "Command Name",
        value: `\`${interaction.commandName}\``,
        inline: false,
      });
    }

    if (interaction.options && interaction.options.data.length > 0) {
      embed.addFields({
        name: "Options/Arguments",
        value: `${await interaction.options.data
          .map((x) => x.value)
          .join(", ")}`,
        inline: false,
      });
    }

    try {
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error sending interaction log message:", error);
    }
  },
};

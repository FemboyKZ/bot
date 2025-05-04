const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const schema = require("../../schemas/base-system.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-setup")
    .setDescription("[Admin] Setup the tickets message and system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("[Admin] Setup the tickets message and system")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel for the tickets info message")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        )
        .addChannelOption((option) =>
          option
            .setName("category")
            .setDescription("The category for the tickets to be sent in")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("update")
        .setDescription("[Admin] Update the tickets system")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel for the tickets info message")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        )
        .addChannelOption((option) =>
          option
            .setName("category")
            .setDescription("The category for the tickets to be sent in")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(false),
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("The message to update with the embeds")
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("[Admin] Disable the tickets system"),
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have the permissions to use this command.",
        ephemeral: true,
      });

    const { guild, options } = interaction;
    const channel =
      interaction.options.getChannel("channel") ||
      message?.channel ||
      interaction.channel;
    const category = interaction.options.getChannel("category");
    const message = interaction.options.getString("message");
    const sub = options.getSubcommand();
    const data = await schema.findOne({
      Guild: guild.id,
      ID: "tickets",
    });

    const embedImage = "https://files.femboy.kz/web/images/wide.png";
    const embedColor = "#ff00b3";

    const embedWhitelist = new EmbedBuilder()
      .setTitle("**FKZ Whitelist**")
      .setImage(embedImage)
      .setColor(embedColor)
      .setDescription(
        "**What is the whitelist and how to get whitelisted?**\nThe whitelist is a list of people that can join *our* private servers.",
      )
      .addFields([
        {
          name: "Why are some servers Whitelist only?",
          value:
            "The whitelist exists to let our members play in peace without having to deal with random people bothering them.",
        },
        {
          name: "Who can get Whitelisted and how?",
          value:
            "To get Whitelisted, you have to be someone I or someone else on the whitelist knows well, such as a friend or acquaintance.\n \nYou can request to join the Whitelist by using the command **/whitelist-request** in any of this servers channls.\nYou can also request to join the Steam group: **<https://steamcommunity.com/groups/FemWL>**",
        },
      ]);

    const embedBans = new EmbedBuilder()
      .setTitle("**FKZ Bans/Un-Bans**")
      .setImage(embedImage)
      .setColor(embedColor)
      .setDescription(
        "If you were banned from one of the servers, you can request for an unban by using the command **/unban-request** in any of this servers channels.",
      )
      .addFields([
        {
          name: "**Please do *not* spam about your ban on any of the chats here.**",
          value:
            "If you haven't received a response to your request *within a few days*, feel free to remind me (<@289767921956290580>) via direct message or by pinging me to check the requests.",
        },
      ]);

    const embedVip = new EmbedBuilder()
      .setTitle("**FKZ VIP / Donations**")
      .setImage(embedImage)
      .setColor(embedColor)
      .setDescription(
        "By choosing to **Donate** to the server you may be able to get VIP perks on the servers and here on Discord",
      )
      .addFields([
        {
          name: "**How to buy VIP & VIP+**",
          value:
            "If you wish to purchase VIP or VIP+, you can do so here:\n\n**<https://femboy.kz/shop>**\n\nAll the needed info can be found there.",
        },
        {
          name: "**How to Claim VIP/VIP+**",
          value:
            "To claim your perks, use the command **/claim-vip** in any of this server's channels.\n\nIf you wish to gift instead, use the command **/gift-vip** in any of this server's channels.",
        },
      ]);

    const embedSupport = new EmbedBuilder()
      .setTitle("FKZ Support")
      .setImage(embedImage)
      .setColor(embedColor)
      .addFields([
        {
          name: "Docs / Guides",
          value: `Check out our **[Docs](https://docs.femboy.kz/)** for more info on how to use the servers.`,
        },
        {
          name: "Reports / Suggestions",
          value: `If you have anything to report or something to suggest as improvement, feel free to do so by using the command **/report-or-suggest** in any of this servers channls.\nIf you have something that doesn't fit the form of this command, or needs direct contact with staff, please open a ticket`,
        },
        {
          name: "Support / Help",
          value: `If you have issues with the servers or anything else, please open a ticket below.\nPlease do not open tickets for asking for whitelist or other pointless reasons.`,
        },
      ])
      .setFooter({ text: `${interaction.guild.name} INFO` })
      .setTimestamp();

    const embedReply = new EmbedBuilder()
      .setTitle("FKZ Ticket system setup")
      .setImage(embedImage)
      .setColor(embedColor);

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket-open")
        .setMaxValues(1)
        .setPlaceholder(`Select a topic for the ticket`)
        .addOptions(
          {
            label: "CS:GO / CS2 Server Issues",
            value: "Subject: Server Issues",
          },
          {
            label: "Indepth Report / Suggestion",
            value: "Subject: Report / Suggestion",
          },
          {
            label: "Other (Redeem Perks)",
            value: "Subject: Other",
          },
        ),
    );

    switch (sub) {
      case "setup":
        try {
          if (data) {
            embedReply.setDescription("Tickets have already been setup");
            return await interaction.reply({
              embeds: [embedReply],
              ephemeral: true,
            });
          } else {
            embedReply.setDescription(
              `Your tickets system has been set up in ${channel}.`,
            );
            await schema.create({
              Guild: interaction.guild.id,
              Channel: category.id,
              ID: "tickets",
            });
            await channel.send({
              embeds: [embedWhitelist, embedBans, embedVip, embedSupport],
              components: [menu],
            });
            await interaction.reply({
              embeds: [embedReply],
              ephemeral: true,
            });
          }
        } catch (err) {
          embedReply.setDescription(
            "There was an error while setting up tickets.",
          );
          console.error("Error executing command:", err);
          await interaction.reply({
            embeds: [embedReply],
            ephemeral: true,
          });
        }
        break;

      case "update":
        try {
          if (!data) {
            embedReply.setDescription("Tickets have not been setup yet.");
            return await interaction.reply({
              embeds: [embedReply],
              ephemeral: true,
            });
          }

          if (!message && !category) {
            embedReply.setDescription(
              "Please specify a message or category to update.",
            );
            return await interaction.reply({
              embeds: [embedReply],
              ephemeral: true,
            });
          }

          if (message) {
            const target = await channel.messages.fetch(message);

            if (target.author.id !== interaction.client.user.id) {
              embedReply.setDescription(
                "The specified message is not owned by FKZ bot.",
              );
              return await interaction.reply({
                embeds: [embedReply],
                ephemeral: true,
              });
            }

            embedReply.addFields({
              name: "Embeds - Success!",
              value: `Your tickets system embeds have been updated in ${channel}.`,
            });

            await target.edit({
              embeds: [embedWhitelist, embedBans, embedVip, embedSupport],
              components: [menu],
            });
            await interaction.reply({
              embeds: [embedReply],
              ephemeral: true,
            });
          }
          if (category) {
            await schema.findOneAndUpdate(
              {
                Guild: guild.id,
                ID: "tickets",
              },
              {
                Channel: category.id,
              },
            );
            embedReply.addFields({
              name: "Category - Success!",
              value: `Your tickets system category has been updated.`,
            });
          }

          await interaction.reply({
            embeds: [embedReply],
            ephemeral: true,
          });
        } catch (err) {
          console.error("Error executing command:", err);
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
        break;

      case "disable":
        try {
          if (!data) {
            return await interaction.reply({
              content: "The tickets system is already disabled.",
              ephemeral: true,
            });
          }
          await schema.deleteMany({
            Guild: guild.id,
            ID: "tickets",
          });
          await interaction.reply({
            content: `The tickets system has been disabled.`,
            ephemeral: true,
          });
        } catch (err) {
          console.error("Error executing command:", err);
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
        break;
    }
  },
};

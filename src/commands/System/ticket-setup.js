const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const ticketSchema = require("../../Schemas/ticketSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-setup")
    .setDescription("[Admin] Setup the tickets message and system")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel for the tickets info message")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("category")
        .setDescription("The category for the tickets to be sent in")
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    interaction.deferReply();

    const channel = interaction.options.getChannel("channel");
    const category = interaction.options.getChannel("category");

    const embedWhitelist = new EmbedBuilder()
      .setTitle("**FKZ Whitelist**")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "**What is the whitelist and how to get whitelisted?**\nThe whitelist is a list of people that can join *our* private servers."
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
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "If you were banned from one of the servers, you can request for an unban by using the command **/unban-request** in any of this servers channels."
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
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "By choosing to **Donate** to the server you may be able to get VIP perks on the servers and here on Discord"
      )
      .addFields([
        {
          name: "**How to buy VIP & VIP+**",
          value:
            "If you wish to purchase VIP or VIP+, you can do so here:\n\n**<https://femboy.kz/shop>**\n\nAll the needed info can be found there.",
        },
      ]);
    const embedClassic = new EmbedBuilder()
      .setTitle("FKZ ClassicCounter")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "To be able to play on the **[ClassicCounter](https://flashboost.ru)** Servers, you need to be *whitelisted*, you can find more info on their [Discord](https://discord.gg/ClassicCounter).\n\nPlease do not open any tickets regarding ClassicCounter, or ping their staff on our Discord server, join theirs instead."
      )
      .addFields([
        {
          name: "**ClassicCounter Website**",
          value:
            "Check out all their Servers here:\n**<https://flashboost.ru/sourcebans/index.php?p=servers>**",
        },
        {
          name: "**ClassicCounter Bans**",
          value:
            "ClassicCounter handles their bans and un-bans on their Discord, but they can be viewed here:\n**<https://flashboost.ru/sourcebans/index.php?p=bans>**",
        },
      ]);
    const embedSupport = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle(`FKZ Support`)
      .setImage("https://femboy.kz/images/wide.png")
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

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("select")
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
          }
        )
    );

    try {
      const data = await ticketSchema.findOne({ Guild: interaction.guild.id });
      if (data) {
        return await interaction.reply({
          content: "Tickets have already been setup",
          ephemeral: true,
        });
      } else {
        ticketSchema.create({
          Guild: interaction.guild.id,
          Channel: category.id,
          Ticket: "first",
        });
        await channel.send({
          embeds: [
            embedWhitelist,
            embedClassic,
            embedBans,
            embedVip,
            embedSupport,
          ],
          components: [menu],
        });
        await interaction.reply({
          content: `Your tickets system has been set up in ${channel}.`,
          ephemeral: true,
        });
      }
    } catch (err) {
      console.error("Error executing command:", err);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};

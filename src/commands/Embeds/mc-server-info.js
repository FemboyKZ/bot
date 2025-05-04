const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mc-server-info-embed")
    .setDescription("[Admin] Posts the embeds the for MC-Sever-Info channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where to send the embed")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const channel = interaction.options.getChannel("channel");

    const embedInfo = new EmbedBuilder()
      .setTitle("**FKZ Minecraft Server Info**")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "> The Server is running Fabric version 1.20.1, you will need a Java version client to connect.",
      )
      .addFields([
        {
          name: "** **",
          value: "Server IP: ||141.94.62.252:25581|| <- (Click to show)",
        },
      ]);

    const embedRules = new EmbedBuilder()
      .setTitle("**FKZ Minecraft Server Rules**")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "> The rules are just here as reminders, just use common sense. Excessively breaking them could get you kicked off the whitelist.\n\nThe rules of the Discord Server also apply on the Minecraft Server. See them here: <#858419058172887073>",
      )
      .addFields([
        {
          name: "** **",
          value:
            "1. Do not grief. You are free to blow up your own creations, but stay away from others stuff unless given permission by them.",
        },
        {
          name: "** **",
          value: `2. Do not steal or "borrow" stuff from others without permission.`,
        },
        {
          name: "** **",
          value: `3. No excessive hacking. Using a modified client for fps boost and such is fine, but hacking for unfair advantage should be avoided.`,
        },
      ]);

    await channel.send({
      embeds: [embedInfo, embedRules],
    });
    await interaction.reply({
      content: `The embeds have been posted on ${channel}.`,
      ephemeral: true,
    });
  },
};

const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mc-info-embed")
    .setDescription("[Admin] Posts the embeds the for MC-Info channel")
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
        flags: MessageFlags.Ephemeral,
      });

    const channel = interaction.options.getChannel("channel");

    const embedInfo = new EmbedBuilder()
      .setTitle("**FKZ Minecraft Info**")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "> FemboyKZ has its own Minecraft server! Its mainly a survival server to build cool stuff as a community, but we could do other things on it in the future.",
      );

    const embedWhitelist = new EmbedBuilder()
      .setTitle("**FKZ Minecraft Whitelist**")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "> The Server has a separate whitelist from the CS servers. To connect to the servers you must be whitelisted.",
      )
      .addFields([
        {
          name: "** **",
          value:
            "To get whitelisted run `/mc-whitelist-request` in any channel and fill in your information.",
        },
      ]);

    await channel.send({
      embeds: [embedInfo, embedWhitelist],
    });
    await interaction.reply({
      content: `The embeds have been posted on ${channel}.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

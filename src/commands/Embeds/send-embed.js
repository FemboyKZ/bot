const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("send-embed")
    .setDescription("[Admin] Posts an embed in your chosen channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where to send the embed")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The title of the embed")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("content")
        .setDescription("The contents of the embed")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("The footer of the embed")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("The color of the embed (e.g. #ff00b3)")
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("ephemeral")
        .setDescription("Whether the embed should be ephemeral")
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("timestamp")
        .setDescription("Whether the embed should have a timestamp")
        .setRequired(false),
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const channel = interaction.options.getChannel("channel");
    const title = interaction.options.getString("title");
    const content = interaction.options.getString("content");
    const footer = interaction.options.getString("footer");
    const color = interaction.options.getString("color");
    const ephemeral = interaction.options.getBoolean("ephemeral");
    const timestamp = interaction.options.getBoolean("timestamp");

    try {
      const embed = new EmbedBuilder().setDescription(content);
      if (title) embed.setTitle(title);
      if (footer) embed.setFooter({ text: footer });
      if (timestamp && timestamp === true) embed.setTimestamp();
      if (color) {
        embed.setColor(color);
      } else {
        embed.setColor("#ff00b3");
      }

      if (ephemeral && ephemeral === true) {
        await channel.send({ embeds: [embed], ephemeral: true });
      } else {
        await channel.send({ embeds: [embed], ephemeral: false });
      }

      await interaction.reply({
        content: `The embed has been posted on ${channel}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command.",
        ephemeral: true,
      });
    }
  },
};

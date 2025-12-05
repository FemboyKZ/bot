const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Show another users avatar")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User whose avatar you want to show")
        .setRequired(true),
    ),

  async execute(interaction) {
    const { channel, options } = interaction;
    const requestedUser = options.getUser("user");

    try {
      const userToShow = requestedUser || interaction.member.user;
      const avatarUrl = userToShow.avatarURL({ size: 512 });

      const embed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTitle(`${userToShow.tag}'s Avatar`)
        .setImage(avatarUrl)
        .setTimestamp();

      const button = new ButtonBuilder()
        .setLabel("Avatar Link")
        .setStyle(ButtonStyle.Link)
        .setURL(avatarUrl);

      const actionRow = new ActionRowBuilder().addComponents(button);

      await channel.send({ embeds: [embed], components: [actionRow] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "An error occurred while processing your request.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

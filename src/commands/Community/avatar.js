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
    const { options } = interaction;
    const requestedUser = options.getUser("user");

    try {
      const userToShow = requestedUser || interaction.user;
      // displayAvatarURL always returns a url (falls back to the default
      // avatar); avatarURL() is null for users without a custom avatar.
      const avatarUrl = userToShow.displayAvatarURL({ size: 512 });

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

      await interaction.reply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
      console.error(error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "An error occurred while processing your request.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};

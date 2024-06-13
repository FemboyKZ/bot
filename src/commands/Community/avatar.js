const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Show another users avatar")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User whose avatar you want to show")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction) {
      throw new Error("Interaction is null or undefined.");
    }

    const { channel, client, options, member } = interaction;
    let user = interaction.options.getUser("user");
    if (!user) {
      if (!member) {
        throw new Error("Member is null or undefined.");
      }
      user = member;
    }

    try {
      let userAvatar = await user.displayAvatarURL({ size: 512 });

      const embed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTitle(`${user.tag}'s Avatar`)
        .setImage(userAvatar)
        .setTimestamp();

      const button = new ButtonBuilder()
        .setLabel("Avatar Link")
        .setStyle(ButtonStyle.Link)
        .setURL(user.avatarURL({ size: 512 }));

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  },
};

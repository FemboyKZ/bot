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
    const { channel, client, options, member } = interaction;
    let user = interaction.options.getUser("user") || interaction.member;
    let userAvatar = user.displayAvatarURL({ size: 512 });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle(`${user.tag}'s Avatar`)
      .setImage(`${userAvatar}`)
      .setTimestamp();

    const button = new ButtonBuilder()
      .setLabel("Avatar Link")
      .setStyle(ButtonStyle.Link)
      .setURL(`${user.avatarURL({ size: 512 })}`);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};

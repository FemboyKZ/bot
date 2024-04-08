const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("servers-embed")
    .setDescription("[Admin] Posts the embed for the Servers channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where to send the embed")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    const channel = interaction.options.getChannel("channel");

    const embed1 = new EmbedBuilder()
      .setTitle("**FemboyKZ Servers**")
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/serverrs.png");

    const embed2 = new EmbedBuilder()
      .setTitle("**CS:GO Servers**")
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/wide.png")
      .addFields([
        {
          name: "Whitelist Servers",
          value: "** **",
          inline: false,
        },
        {
          name: ":flag_eu:  **128t GLOBAL**",
          value: "[*euwl.femboy.kz:27959*](<https://femboy.kz/csgo/wlEU>)",
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **128t GLOBAL**",
          value: "[*nawl.femboy.kz:28455*](<https://femboy.kz/csgo/wlNA>)",
          inline: true,
        },
        {
          name: "Public Servers",
          value: "** **",
          inline: false,
        },
        {
          name: ":flag_eu:  **64t AutoBH**",
          value: "[*eu64.femboy.kz:27138*](<https://femboy.kz/csgo/64tEU>)",
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **64t AutoBH**",
          value: "[*na64.femboy.kz:27945*](<https://femboy.kz/csgo/64tNA>)",
          inline: true,
        },
        {
          name: ":flag_eu:  **64t AutoBH\n- de_nuke only**",
          value:
            "[*eunu.femboy.kz:28729*](<https://femboy.kz/csgo/64tEU-nuke>)",
          inline: true,
        },
      ]);
    const embed3 = new EmbedBuilder()
      .setTitle("**CS2 Servers**")
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/wide.png")
      .addFields([
        {
          name: "Public Servers",
          value: "** **",
          inline: false,
        },
        {
          name: ":flag_eu:  **64t Movement**",
          value: "[*eu1.femboy.kz:26237*](<https://femboy.kz/cs2/EU1>)",
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **64t Movement**",
          value: "[*na1.femboy.kz:26578*](<https://femboy.kz/cs2/NA1>)",
          inline: true,
        },
        {
          name: ":flag_eu:  **64t Movement 2**",
          value: "[*eu2.femboy.kz:26803*](<https://femboy.kz/cs2/EU2>)",
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **64t Movement 2**",
          value: "[*na2.femboy.kz:26212*](<https://femboy.kz/cs2/NA2>)",
          inline: true,
        },
      ]);
    await channel.send({
      embeds: [embed1, embed2, embed3],
    });
    await interaction.reply({
      content: `The embeds have been posted on ${channel}.`,
      ephemeral: true,
    });
  },
};

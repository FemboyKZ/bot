const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("servers-embed")
    .setDescription("[Admin] Posts the embed for the Servers channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where to send the embed")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    const channel = interaction.options.getChannel("channel");

    const csgoWLeu = "euwl.femboy.kz:27025";
    const csgo64eu = "eu64.femboy.kz:27035";
    const csgoNUeu = "eunu.femboy.kz:27045";

    const csgoWLna = "nawl.femboy.kz:28455";
    const csgo64na = "na64.femboy.kz:27945";

    const cscl128eu = "classic.femboy.kz:27099";
    const cscl128eukzt = "classic.femboy.kz:27079";
    const cscl64eu = "classic.femboy.kz:27089";

    const cs2WLeu = "euwl.femboy.kz";
    const cs2KZeu = "eu1.femboy.kz:27016";
    const cs2MVeu = "eu2.femboy.kz:27017";

    const cs2KZna = "na1.femboy.kz:26578";
    const cs2MVna = "na2.femboy.kz:26212";

    const embedHeader = new EmbedBuilder()
      .setTitle("**FemboyKZ Servers**")
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/serverrs.png");

    const embedCSGO = new EmbedBuilder()
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
          value: `[*${csgoWLeu}*](<https://csgo.femboy.kz/connect?ip=${csgoWLeu}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **128t GLOBAL**",
          value: `[*${csgoWLna}*](<https://csgo.femboy.kz/connect?ip=${csgoWLna}>)`,
          inline: true,
        },
        {
          name: "Public Servers",
          value: "** **",
          inline: false,
        },
        {
          name: ":flag_eu:  **64t AutoBH**",
          value: `[*${csgo64eu}*](<https://csgo.femboy.kz/connect?ip=${csgo64eu}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **64t AutoBH**",
          value: `[*${csgo64na}*](<https://csgo.femboy.kz/connect?ip=${csgo64na}>)`,
          inline: true,
        },
        {
          name: ":flag_eu:  **64t AutoBH\n- de_nuke only**",
          value: `[*${csgoNUeu}*](<https://csgo.femboy.kz/connect?ip=${csgoNUeu}>)`,
          inline: true,
        },
      ]);

    const embedCSCL = new EmbedBuilder()
      .setTitle("**ClassicCounter Servers**")
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/wide.png")
      .addFields([
        {
          name: "CC Whitelist Servers",
          value: "** **",
          inline: false,
        },
        {
          name: ":flag_eu:  **128t VNL KZ**",
          value: `[*${cscl128eu}*](<https://classic.femboy.kz/connect?ip=${cscl128eu}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_eu:  **64t VNL KZ**",
          value: `[*${cscl64eu}*](<https://classic.femboy.kz/connect?ip=${cscl64eu}>)`,
          inline: true,
        },
        {
          name: ":flag_eu:  **128t KZTimer**",
          value: `[*${cscl128eukzt}*](<https://classic.femboy.kz/connect?ip=${cscl128eukzt}>)`,
          inline: true,
        },
      ]);

    const embedCS2 = new EmbedBuilder()
      .setTitle("**CS2 Servers**")
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/wide.png")
      .addFields([
        {
          name: "Whitelist Servers",
          value: "** **",
          inline: false,
        },
        {
          name: ":flag_eu:  **KZ**",
          value: `[*${cs2WLeu}*](<https://cs2.femboy.kz/connect?ip=${cs2WLeu}:27015>)`,
          inline: true,
        },
        {
          name: "Public Servers",
          value: "** **",
          inline: false,
        },
        {
          name: ":flag_eu:  **KZ**",
          value: `[*${cs2KZeu}*](<https://cs2.femboy.kz/connect?ip=${cs2KZeu}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **KZ**",
          value: `[*${cs2KZna}*](<https://cs2.femboy.kz/connect?ip=${cs2KZna}>)`,
          inline: true,
        },
        {
          name: ":flag_eu:  **Movement**",
          value: `[*${cs2MVeu}*](<https://cs2.femboy.kz/connect?ip=${cs2MVeu}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **Movement**",
          value: `[*${cs2MVna}*](<https://cs2.femboy.kz/connect?ip=${cs2MVna}>)`,
          inline: true,
        },
      ]);

    await channel.send({
      embeds: [embedHeader, embedCSGO, embedCSCL, embedCS2],
    });
    await interaction.reply({
      content: `The embeds have been posted on ${channel}.`,
      ephemeral: true,
    });
  },
};

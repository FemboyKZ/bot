const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
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
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to update with the embed")
        .setRequired(false),
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const channel =
      interaction.options.getChannel("channel") ||
      message?.channel ||
      interaction.channel;
    const message = interaction.options.getString("message");

    if (!channel && !message) {
      return await interaction.reply({
        content: "Please provide a channel or message.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const csgoWLeu = "eu.femboy.kz:27025";
    const csgoGLeu1 = "eu.femboy.kz:27030";
    const csgoGLeu2 = "eu.femboy.kz:27035";
    const csgoGLeu3 = "eu.femboy.kz:27040";
    const csgo64eu = "eu.femboy.kz:27045";

    const csgoWLna = "na.femboy.kz:27025";
    const csgoGLna = "na.femboy.kz:27030";
    const csgo64na = "na.femboy.kz:27035";

    const cs2WLeu = "eu.femboy.kz";
    const cs2KZeu = "eu.femboy.kz:27016";
    const cs2KZ2eu = "eu.femboy.kz:27017";
    const cs2MVeu = "eu.femboy.kz:27019";

    const cs2KZna = "na.femboy.kz";
    const cs2KZ2na = "na.femboy.kz:27016";
    const cs2MVna = "na.femboy.kz:27017";

    const cs2KZas = "as.femboy.kz:26532";
    const cs2KZau = "au.femboy.kz:25064";
    const cs2KZsa = "sa.femboy.kz:25126";
    const cs2KZza = "za.femboy.kz:26518";

    const embedHeader = new EmbedBuilder()
      .setTitle("**FemboyKZ Servers**")
      .setColor("#ff00b3")
      .setImage("https://files.femboy.kz/web/images/servers-banner.png");

    const embedCSGO = new EmbedBuilder()
      .setTitle("**CS:GO Servers**")
      .setColor("#ff00b3")
      .setImage("https://files.femboy.kz/web/images/wide.png")
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
          name: ":flag_eu:  **128t GLOBAL**",
          value: `[*${csgoGLeu1}*](<https://csgo.femboy.kz/connect?ip=${csgoGLeu1}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_eu:  **128t GLOBAL 2**",
          value: `[*${csgoGLeu2}*](<https://csgo.femboy.kz/connect?ip=${csgoGLeu2}>)`,
          inline: true,
        },
        {
          name: ":flag_eu:  **128t GLOBAL 3**",
          value: `[*${csgoGLeu3}*](<https://csgo.femboy.kz/connect?ip=${csgoGLeu3}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **128t GLOBAL**",
          value: `[*${csgoGLna}*](<https://csgo.femboy.kz/connect?ip=${csgoGLna}>)`,
          inline: true,
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
          value: `[*${cs2KZna}*](<https://cs2.femboy.kz/connect?ip=${cs2KZna}:27015>)`,
          inline: true,
        },
        {
          name: ":flag_eu:  **KZ**",
          value: `[*${cs2KZ2eu}*](<https://cs2.femboy.kz/connect?ip=${cs2KZ2eu}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **KZ**",
          value: `[*${cs2KZ2na}*](<https://cs2.femboy.kz/connect?ip=${cs2KZ2na}>)`,
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
        {
          name: ":flag_hk:  **KZ**",
          value: `[*${cs2KZas}*](<https://cs2.femboy.kz/connect?ip=${cs2KZas}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_au:  **KZ**",
          value: `[*${cs2KZau}*](<https://cs2.femboy.kz/connect?ip=${cs2KZau}>)`,
          inline: true,
        },
        {
          name: ":flag_br:  **KZ**",
          value: `[*${cs2KZsa}*](<https://cs2.femboy.kz/connect?ip=${cs2KZsa}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_za:  **KZ**",
          value: `[*${cs2KZza}*](<https://cs2.femboy.kz/connect?ip=${cs2KZza}>)`,
          inline: true,
        },
      ]);

    if (message) {
      const target = await channel.messages.fetch(message);

      if (target.author.id !== interaction.client.user.id) {
        return await interaction.reply({
          content: "The specified message is not owned by FKZ bot.",
          flags: MessageFlags.Ephemeral,
        });
      }
      await target.edit({
        embeds: [embedCSGO, embedCS2],
      });
    } else {
      await channel.send({
        embeds: [embedCSGO, embedCS2],
      });
    }
    await interaction.reply({
      content: `The embeds have been posted on ${channel}.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

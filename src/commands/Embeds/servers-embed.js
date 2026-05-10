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

    const csgoWLeu = "eu.femboykz.com:27025";
    const csgoGLeu1 = "eu.femboykz.com:27030";
    const csgoGLeu2 = "eu.femboykz.com:27035";
    const csgoGLeu3 = "eu.femboykz.com:27040";
    const csgo64eu = "eu.femboykz.com:27045";

    const csgoWLna = "na.femboykz.com:27025";
    const csgoGLna = "na.femboykz.com:27030";
    const csgo64na = "na.femboykz.com:27035";

    const cs2WLeu = "eu.femboykz.com";
    const cs2WLeu2 = "eu.femboykz.com:27016";
    const cs2KZeu = "eu.femboykz.com:27017";
    const cs2KZeu2 = "eu.femboykz.com:27019";
    const cs2KZeu3 = "eu.femboykz.com:27020";
    const cs2KZeu4 = "eu.femboykz.com:27021";

    const cs2KZna = "na.femboykz.com";
    const cs2KZna2 = "na.femboykz.com:27016";
    const cs2KZna3 = "na.femboykz.com:27017";
    const cs2KZna4 = "na.femboykz.com:27018";
    const cs2KZna5 = "na.femboykz.com:27019";

    const cs2KZas = "as.femboykz.com:26532";
    const cs2KZau = "au.femboykz.com:25064";
    const cs2KZsa = "sa.femboykz.com:25126";
    const cs2KZza = "za.femboykz.com:26518";

    const _embedHeader = new EmbedBuilder()
      .setTitle("**FemboyKZ Servers**")
      .setColor("#ff00b3")
      .setImage(
        "https://files.femboykz.com/web/images/servers-banner.png?raw=1",
      );

    const embedCSGO = new EmbedBuilder()
      .setTitle("**CS:GO Servers**")
      .setColor("#ff00b3")
      .setImage("https://files.femboykz.com/web/images/wide.png?raw=1")
      .addFields([
        {
          name: "Whitelist Servers",
          value: "** **",
          inline: false,
        },
        {
          name: ":flag_eu:  **128t GLOBAL**",
          value: `[*${csgoWLeu}*](<https://csgo.femboykz.com/connect.php?ip=${csgoWLeu}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **128t GLOBAL**",
          value: `[*${csgoWLna}*](<https://csgo.femboykz.com/connect.php?ip=${csgoWLna}>)`,
          inline: true,
        },
        {
          name: "Public Servers",
          value: "** **",
          inline: false,
        },
        {
          name: ":flag_eu:  **128t GLOBAL**",
          value: `[*${csgoGLeu1}*](<https://csgo.femboykz.com/connect.php?ip=${csgoGLeu1}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_eu:  **128t GLOBAL 2**",
          value: `[*${csgoGLeu2}*](<https://csgo.femboykz.com/connect.php?ip=${csgoGLeu2}>)`,
          inline: true,
        },
        {
          name: ":flag_eu:  **128t GLOBAL 3**",
          value: `[*${csgoGLeu3}*](<https://csgo.femboykz.com/connect.php?ip=${csgoGLeu3}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **128t GLOBAL**",
          value: `[*${csgoGLna}*](<https://csgo.femboykz.com/connect.php?ip=${csgoGLna}>)`,
          inline: true,
        },
        {
          name: ":flag_eu:  **64t AutoBH**",
          value: `[*${csgo64eu}*](<https://csgo.femboykz.com/connect.php?ip=${csgo64eu}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **64t AutoBH**",
          value: `[*${csgo64na}*](<https://csgo.femboykz.com/connect.php?ip=${csgo64na}>)`,
          inline: true,
        },
      ]);

    const embedCS2 = new EmbedBuilder()
      .setTitle("**CS2 Servers**")
      .setColor("#ff00b3")
      .setImage("https://femboykz.com/images/wide.png?raw=1")
      .addFields([
        {
          name: "Whitelist Servers",
          value: "** **",
          inline: false,
        },
        {
          name: ":flag_eu:  **KZ 1**",
          value: `[*${cs2WLeu}*](<https://cs2.femboykz.com/connect.php?ip=${cs2WLeu}:27015>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_eu:  **KZ 2**",
          value: `[*${cs2WLeu2}*](<https://cs2.femboykz.com/connect.php?ip=${cs2WLeu2}>)`,
          inline: true,
        },
        {
          name: "Public Servers",
          value: "** **",
          inline: false,
        },
        {
          name: ":flag_eu:  **KZ 1**",
          value: `[*${cs2KZeu}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZeu}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_eu:  **KZ 2**",
          value: `[*${cs2KZeu2}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZeu2}>)`,
          inline: true,
        },
        {
          name: ":flag_eu:  **KZ 3**",
          value: `[*${cs2KZeu3}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZeu3}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_eu:  **KZ 4**",
          value: `[*${cs2KZeu4}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZeu4}>)`,
          inline: true,
        },
        {
          name: ":flag_us:  **KZ 1**",
          value: `[*${cs2KZna}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZna}:27015>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **KZ 2**",
          value: `[*${cs2KZna2}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZna2}>)`,
          inline: true,
        },
        {
          name: ":flag_us:  **KZ 3**",
          value: `[*${cs2KZna3}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZna3}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_us:  **KZ 4**",
          value: `[*${cs2KZna4}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZna4}>)`,
          inline: true,
        },
        {
          name: ":flag_us:  **KZ 5**",
          value: `[*${cs2KZna5}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZna5}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_hk:  **KZ 1**",
          value: `[*${cs2KZas}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZas}>)`,
          inline: true,
        },
        {
          name: ":flag_au:  **KZ 1**",
          value: `[*${cs2KZau}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZau}>)`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: ":flag_br:  **KZ 1**",
          value: `[*${cs2KZsa}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZsa}>)`,
          inline: true,
        },
        {
          name: ":flag_za:  **KZ 1**",
          value: `[*${cs2KZza}*](<https://cs2.femboykz.com/connect.php?ip=${cs2KZza}>)`,
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

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot-info")
    .setDescription("Displays current bot status and info"),

  async execute(interaction, client) {
    const name = 'Femboy KZ#7476';
    const icon = `${client.user.displayAvatarURL()}`;
    let servercount = await client.guilds.cache.reduce(
      (a, b) => a + b.memberCount,
      0
    );

    let totalSeconds = client.uptime / 1000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    let uptime = `${days} Days, ${hours} Hours, ${minutes} Minutes & ${seconds} Seconds`;

    let ping = `${Date.now() - interaction.createdTimestamp}ms.`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Femboy KZ Discord")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.gg/BVwG5zdgpD/"),

      new ButtonBuilder()
        .setLabel("Femboy KZ Steam Group")
        .setStyle(ButtonStyle.Link)
        .setURL("https://steamcommunity.com/groups/FemboyKZ")
    );

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setThumbnail(`${icon}`)
      .setAuthor({ name: name, iconURL: icon })
      .setFooter({ text: `BotID: 935848758430793809` })
      .setTimestamp()
      .addFields([
        {
          name: "Server Count",
          value: `${client.guilds.cache.size}`,
          inline: true,
        },
        {
          name: "Server Members",
          value: `${servercount}`,
          inline: true,
        },
        {
          name: "Latency",
          value: `${ping}`,
          inline: true,
        },
        {
          name: "Uptime",
          value: `\`\`\`${uptime}\`\`\``,
          inline: true,
        },
        {
          name: "Developer",
          value: `<@289767921956290580>`,
          inline: false,
        },
      ]);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

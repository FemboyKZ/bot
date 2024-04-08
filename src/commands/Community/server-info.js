const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-info")
    .setDescription("Displays current server info"),

  async execute(interaction) {
    const { guild } = interaction;
    const { members } = guild;
    const { name, ownerId, createdTimestamp, memberCount } = guild;
    const icon =
      guild.iconURL() || "https://femboy.kz/images/discord-logo-7-11.png";
    const roles = guild.roles.cache.size;
    const emojis = guild.emojis.cache.size;
    const id = guild.id;
    const channels = guild.channels.cache.size;

    let baseVerification = guild.VerificationLevel;

    if (baseVerification == 0) baseVerification = "None";
    if (baseVerification == 1) baseVerification = "Low";
    if (baseVerification == 2) baseVerification = "Medium";
    if (baseVerification == 3) baseVerification = "High";
    if (baseVerification == 4) baseVerification = "Very High";

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setThumbnail(icon)
      .setAuthor({ name: name, iconURL: icon })
      .setFooter({ text: `ServerID: ${id}` })
      .setTimestamp()
      .addFields([
        {
          name: "Server Name",
          value: `${name}`,
          inline: false,
        },
        {
          name: "Date Created",
          value: `<t:${parseInt(createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "Server Owner",
          value: `<@${ownerId}>`,
          inline: true,
        },
        {
          name: "Member Count",
          value: `${memberCount}`,
          inline: true,
        },
        {
          name: "Role Count",
          value: `${roles}`,
          inline: true,
        },
        {
          name: "Emoji Count",
          value: `${emojis}`,
          inline: true,
        },
        {
          name: "Verification Level",
          value: `${baseVerification}`,
          inline: true,
        },
        {
          name: "Server Boost Count",
          value: `${guild.premiumSubscriptionCount}`,
          inline: true,
        },
        {
          name: "Channel Count",
          value: `${channels}`,
          inline: true,
        },
      ]);

    await interaction.reply({ embeds: [embed] });
  },
};

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-info")
    .setDescription("Displays current server info"),

  async execute(interaction) {
    if (!interaction || !interaction.guild) {
      throw new Error("Missing required parameters");
    }

    const guild = interaction.guild;
    const { name, ownerId, createdTimestamp, memberCount } = guild;
    const icon =
      guild.iconURL() || "https://femboy.kz/images/discord-logo-7-11.png";
    const roles = guild.roles.cache.size;
    const emojis = guild.emojis.cache.size;
    const id = guild.id;
    const channels = guild.channels.cache.size;

    let baseVerification = guild.verificationLevel;

    switch (baseVerification) {
      case "NONE":
        baseVerification = "None";
        break;
      case "LOW":
        baseVerification = "Low";
        break;
      case "MEDIUM":
        baseVerification = "Medium";
        break;
      case "HIGH":
        baseVerification = "High";
        break;
      case "VERY_HIGH":
        baseVerification = "Very High";
        break;
      default:
        baseVerification = "Unknown";
    }

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setThumbnail(icon)
      .setAuthor({ name, iconURL: icon })
      .setFooter({ text: `ServerID: ${id}` })
      .setTimestamp()
      .addFields([
        {
          name: "Server Name",
          value: name,
          inline: false,
        },
        {
          name: "Date Created",
          value: `<t:${Math.floor(createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "Server Owner",
          value: `<@${ownerId}>`,
          inline: true,
        },
        {
          name: "Member Count",
          value: String(memberCount),
          inline: true,
        },
        {
          name: "Role Count",
          value: String(roles),
          inline: true,
        },
        {
          name: "Emoji Count",
          value: String(emojis),
          inline: true,
        },
        {
          name: "Verification Level",
          value: baseVerification,
          inline: true,
        },
        {
          name: "Server Boost Count",
          value: String(guild.premiumSubscriptionCount),
          inline: true,
        },
        {
          name: "Channel Count",
          value: String(channels),
          inline: true,
        },
      ]);

    await interaction.reply({ embeds: [embed] });
  },
};

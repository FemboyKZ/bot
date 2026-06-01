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
      guild.iconURL() || "https://femboykz.com/images/discord-logo-7-11.png";
    const roles = guild.roles.cache.size;
    const emojis = guild.emojis.cache.size;
    const id = guild.id;
    const channels = guild.channels.cache.size;

    // verificationLevel is a numeric enum in discord.js v14
    // (0 None .. 4 Very High), not a string.
    const verificationLevels = ["None", "Low", "Medium", "High", "Very High"];
    const baseVerification =
      verificationLevels[guild.verificationLevel] ?? "Unknown";

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
          value: String(guild.premiumSubscriptionCount ?? 0),
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

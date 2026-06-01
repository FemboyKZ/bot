const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const logs = require("../../../schemas/events/emojis.js");

module.exports = {
  name: Events.GuildEmojiDelete,
  async execute(emoji, client) {
    const channel = await getAuditChannel(emoji.guild, client);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: emoji.guild.id,
      Emoji: emoji.id,
    });

    const image = emoji.imageURL({ size: 128 }) || logData?.Image;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ • ID: ${emoji.id}` })
      .setTitle("Emoji Deleted")
      .addFields(
        {
          name: "Name",
          value: emoji.name || logData?.Name || "Unknown",
          inline: false,
        },
        {
          name: "Author",
          value: logData?.User ? `<@${logData.User}>` : "Unknown",
          inline: false,
        },
        {
          name: "Animated?",
          value: emoji.animated ? "Yes" : "No",
          inline: false,
        },
      );
    if (image) embed.setImage(image);
    try {
      if (logData) {
        await logs.deleteMany({ Guild: emoji.guild.id, Emoji: emoji.id });
      }
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in EmojiDelete event:", error);
    }
  },
};

const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../schemas/base-system.js");
const logs = require("../../schemas/events/emojis.js");
const settings = require("../../schemas/events/settings.js");

module.exports = {
  name: Events.GuildEmojiDelete,
  async execute(emoji, client) {
    const settingsData = await settings.findOne({
      Guild: emoji.guild.id,
    });
    if (settingsData.Emojis === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

    const auditlogData = await schema.findOne({
      Guild: emoji.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: emoji.guild.id,
      Emoji: emoji.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setImage(emoji.imageURL({ size: 128 }) || logData.Image)
      .setFooter({ text: `FKZ • ID: ${emoji.id}` })
      .setTitle("Emoji Deleted")
      .addFields(
        {
          name: "Name",
          value: emoji.name ? logData.Name : "Unknown",
          inline: false,
        },
        {
          name: "Author",
          value: emoji.author ? logData.User : "Unknown",
          inline: false,
        },
        {
          name: "Animated?",
          value: emoji.animated ? logData.Animated : "Unknown",
          inline: false,
        }
      );
    try {
      if (logData && settingsData.Store === true) {
        await logs.deleteMany({ Guild: emoji.guild.id, Emoji: emoji.id });
      }
      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error in EmojiDelete event:", error);
    }
  },
};

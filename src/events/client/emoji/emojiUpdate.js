const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/emojis.js");

module.exports = {
  name: Events.GuildEmojiUpdate,
  async execute(oldEmoji, newEmoji, client) {
    const auditlogData = await schema.findOne({
      Guild: newEmoji.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: oldEmoji.guild.id,
      Emoji: oldEmoji.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setImage(newEmoji.imageURL({ size: 128 }) || logData.Image)
      .setFooter({ text: `FKZ • ID: ${newEmoji.id}` })
      .setTitle("Emoji Edited")
      .addFields({
        name: "Author:",
        value: newEmoji.author ? logData.User : "Unknown",
        inline: false,
      });

    try {
      if (!logData) {
        await logs.create({
          Guild: newEmoji.guild.id,
          Emoji: newEmoji.id,
          Name: newEmoji.name ? oldEmoji.name : null,
          User: newEmoji.author.id ? oldEmoji.author.id : null,
          Animated: newEmoji.animated ? oldEmoji.animated : null,
          Created: newEmoji.createdAt,
          Image: newEmoji.imageURL({ size: 128 }),
        });
      }

      if (oldEmoji.name !== newEmoji.name) {
        embed.addFields({
          name: "Name:",
          value: `\`${oldEmoji.name ? logData.Name : "none"}\` →\`${
            newEmoji.name || "Unknown"
          }\``,
          inline: false,
        });
        if (logData) {
          await logs.findOneAndUpdate(
            { Guild: oldEmoji.guild.id, Emoji: oldEmoji.id },
            { Name: newEmoji.name },
          );
        }
        await channel.send({ embeds: [embed] });
      }

      if (oldEmoji.animated !== newEmoji.animated) {
        embed.addFields({
          name: "Animated:",
          value: `\`${oldEmoji.animated ? logData.Animated : "none"}\` →\`${
            newEmoji.animated || "Unknown"
          }\``,
          inline: false,
        });
        if (logData) {
          await logs.findOneAndUpdate(
            { Guild: oldEmoji.guild.id, Emoji: oldEmoji.id },
            { Animated: newEmoji.animated },
          );
        }
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error in EmojiUpdate event:", error);
    }
  },
};

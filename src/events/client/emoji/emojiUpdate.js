const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const logs = require("../../../schemas/events/emojis.js");

module.exports = {
  name: Events.GuildEmojiUpdate,
  async execute(oldEmoji, newEmoji, client) {
    const channel = await getAuditChannel(newEmoji.guild, client);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: oldEmoji.guild.id,
      Emoji: oldEmoji.id,
    });

    const image = newEmoji.imageURL({ size: 128 });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ • ID: ${newEmoji.id}` })
      .setTitle("Emoji Edited")
      .addFields({
        name: "Author:",
        value: logData?.User ? `<@${logData.User}>` : "Unknown",
        inline: false,
      });
    if (image) embed.setImage(image);

    try {
      if (!logData) {
        await logs.create({
          Guild: newEmoji.guild.id,
          Emoji: newEmoji.id,
          Name: oldEmoji.name || null,
          User: oldEmoji.author?.id || null,
          Animated: oldEmoji.animated ?? null,
          Created: newEmoji.createdAt,
          Image: image,
        });
      }

      if (oldEmoji.name !== newEmoji.name) {
        embed.addFields({
          name: "Name:",
          value: `\`${oldEmoji.name || "none"}\` →\`${
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
          value: `\`${oldEmoji.animated ? "Yes" : "No"}\` →\`${
            newEmoji.animated ? "Yes" : "No"
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

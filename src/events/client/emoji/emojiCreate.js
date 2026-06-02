const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");
const logs = require("../../../schemas/events/emojis.js");

module.exports = {
  name: Events.GuildEmojiCreate,
  async execute(emoji, client) {
    const channel = await getAuditChannel(emoji.guild, client);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: emoji.guild.id,
      Emoji: emoji.id,
    });

    // author isn't populated on the create payload, fetch it.
    const author = await emoji.fetchAuthor().catch(() => null);
    const image = emoji.imageURL({ size: 128 });

    const embed = fkzEmbed()
      .setFooter({ text: `FKZ • ID: ${emoji.id}` })
      .setTitle("Emoji Added")
      .addFields(
        {
          name: "Name",
          value: emoji.name || logData?.Name || "Unknown",
          inline: false,
        },
        {
          name: "Author",
          value: author ? `<@${author.id}>` : "Unknown",
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
        await logs.findOneAndUpdate(
          { Guild: emoji.guild.id, Emoji: emoji.id },
          {
            Name: emoji.name,
            User: author?.id || null,
            Animated: emoji.animated || null,
            Image: image,
          },
        );
      } else {
        await logs.create({
          Guild: emoji.guild.id,
          Emoji: emoji.id,
          Name: emoji.name,
          User: author?.id || null,
          Created: emoji.createdAt,
          Animated: emoji.animated,
          Image: image,
        });
      }
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in EmojiCreate event:", error);
    }
  },
};

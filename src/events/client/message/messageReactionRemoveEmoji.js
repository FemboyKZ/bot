const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { emojiKey } = require("../../../utils/emoji.js");

module.exports = {
  // Fires when every reaction of a single emoji is removed from a message,
  // unlike MessageReactionRemove which is one user un-reacting.
  name: Events.MessageReactionRemoveEmoji,
  async execute(reaction, client) {
    try {
      if (reaction.partial) await reaction.fetch();
      if (reaction.message.partial) await reaction.message.fetch();
    } catch {
      return;
    }
    if (!reaction.message.guild) return;

    const channel = await getAuditChannel(reaction.message.guild, client);
    if (!channel) return;

    const display = emojiKey(reaction.emoji);

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("Reaction Emoji Cleared")
      .setFooter({ text: `FKZ • ID: ${reaction.message.id}` })
      .addFields(
        { name: "Emoji", value: `${display}`, inline: true },
        {
          name: "Channel",
          value: `<#${reaction.message.channelId}>`,
          inline: true,
        },
        {
          name: "Message",
          value: `[Jump to message](${reaction.message.url})`,
          inline: true,
        },
      );

    await channel
      .send({ embeds: [embed] })
      .catch((e) =>
        console.error("MessageReactionRemoveEmoji send failed:", e),
      );
  },
};

const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");

module.exports = {
  name: Events.MessageReactionRemoveAll,
  async execute(message, _reactions, client) {
    try {
      if (message.partial) await message.fetch();
    } catch {
      return;
    }
    if (!message.guild) return;

    const channel = await getAuditChannel(message.guild, client);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("All Reactions Removed")
      .setFooter({ text: `FKZ • ID: ${message.id}` })
      .addFields(
        { name: "Channel", value: `<#${message.channelId}>`, inline: true },
        {
          name: "Message",
          value: `[Jump to message](${message.url})`,
          inline: true,
        },
      );

    await channel
      .send({ embeds: [embed] })
      .catch((e) => console.error("MessageReactionRemoveAll send failed:", e));
  },
};

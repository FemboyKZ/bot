const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");
const logs = require("../../../schemas/events/messages.js");

module.exports = {
  name: Events.MessageBulkDelete,
  async execute(messages, channel, client) {
    if (!channel?.guild) return;

    const auditChannel = await getAuditChannel(channel.guild, client);
    if (!auditChannel) return;

    const date = new Date();
    const list = [...messages.values()];

    // (skip partials/webhooks/bots we can't resolve).
    const byAuthor = new Map();
    for (const msg of list) {
      const author = msg.author;
      if (!author) continue;
      const key = `<@${author.id}> - \`${author.username}\``;
      byAuthor.set(key, (byAuthor.get(key) || 0) + 1);
    }

    let breakdown = [...byAuthor.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([who, count]) => `${who}: ${count}`)
      .join("\n");
    if (!breakdown) breakdown = "Unknown (uncached messages)";
    if (breakdown.length > 1024) breakdown = `${breakdown.slice(0, 1000)}\n…`;

    const embed = fkzEmbed()
      .setFooter({ text: "FKZ" })
      .setTitle("Bulk Messages Deleted")
      .addFields(
        { name: "Channel", value: `<#${channel.id}>`, inline: true },
        { name: "Count", value: `${messages.size}`, inline: true },
        { name: "Authors", value: breakdown, inline: false },
      );

    try {
      // Flag any messages we already had on record as deleted.
      const ids = list.map((m) => m.id);
      if (ids.length) {
        await logs.updateMany(
          { Guild: channel.guild.id, Message: { $in: ids } },
          { Deleted: date },
        );
      }
      await auditChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in MessageBulkDelete event:", error);
    }
  },
};

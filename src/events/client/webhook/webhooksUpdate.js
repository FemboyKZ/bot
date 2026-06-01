const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");

module.exports = {
  name: Events.WebhooksUpdate,
  async execute(webhookChannel, client) {
    if (!webhookChannel?.guild) return;

    const channel = await getAuditChannel(webhookChannel.guild, client);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("Webhooks Updated")
      .setFooter({ text: `FKZ • ID: ${webhookChannel.id}` })
      .addFields({
        name: "Channel",
        value: `<#${webhookChannel.id}>`,
        inline: false,
      });

    await channel
      .send({ embeds: [embed] })
      .catch((e) => console.error("WebhooksUpdate send failed:", e));
  },
};

const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");

module.exports = {
  name: Events.GuildScheduledEventDelete,
  async execute(guildScheduledEvent, client) {
    const event = guildScheduledEvent;
    if (!event?.guild) return;

    const channel = await getAuditChannel(event.guild, client);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("Scheduled Event Deleted")
      .setFooter({ text: `FKZ • ID: ${event.id}` })
      .addFields(
        { name: "Name", value: event.name || "Unknown", inline: false },
        {
          name: "Creator",
          value: event.creatorId ? `<@${event.creatorId}>` : "Unknown",
          inline: true,
        },
        {
          name: "Location",
          value: event.channelId
            ? `<#${event.channelId}>`
            : event.entityMetadata?.location || "External",
          inline: false,
        },
      );

    await channel
      .send({ embeds: [embed] })
      .catch((e) => console.error("GuildScheduledEventDelete send failed:", e));
  },
};

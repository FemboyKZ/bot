const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");

module.exports = {
  name: Events.GuildScheduledEventCreate,
  async execute(guildScheduledEvent, client) {
    const event = guildScheduledEvent;
    if (!event?.guild) return;

    const channel = await getAuditChannel(event.guild, client);
    if (!channel) return;

    const start = event.scheduledStartTimestamp
      ? `<t:${Math.floor(event.scheduledStartTimestamp / 1000)}:F>`
      : "Unknown";

    const embed = fkzEmbed()
      .setTitle("Scheduled Event Created")
      .setFooter({ text: `FKZ • ID: ${event.id}` })
      .addFields(
        { name: "Name", value: event.name || "Unknown", inline: false },
        {
          name: "Creator",
          value: event.creatorId ? `<@${event.creatorId}>` : "Unknown",
          inline: true,
        },
        { name: "Starts", value: start, inline: true },
        {
          name: "Location",
          value: event.channelId
            ? `<#${event.channelId}>`
            : event.entityMetadata?.location || "External",
          inline: false,
        },
      );

    if (event.description) {
      embed.addFields({
        name: "Description",
        value: event.description.slice(0, 1024),
        inline: false,
      });
    }

    await channel
      .send({ embeds: [embed] })
      .catch((e) => console.error("GuildScheduledEventCreate send failed:", e));
  },
};

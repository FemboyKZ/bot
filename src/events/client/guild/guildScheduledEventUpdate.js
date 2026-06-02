const { Events, GuildScheduledEventStatus } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");

const STATUS = {
  [GuildScheduledEventStatus.Scheduled]: "Scheduled",
  [GuildScheduledEventStatus.Active]: "Active",
  [GuildScheduledEventStatus.Completed]: "Completed",
  [GuildScheduledEventStatus.Canceled]: "Canceled",
};

module.exports = {
  name: Events.GuildScheduledEventUpdate,
  async execute(oldGuildScheduledEvent, newGuildScheduledEvent, client) {
    const oldE = oldGuildScheduledEvent;
    const newE = newGuildScheduledEvent;
    if (!newE?.guild) return;

    const changes = [];
    const push = (name, before, after) => {
      if (before !== after) {
        changes.push({
          name,
          value: `\`${(before ?? "none").toString().slice(0, 480)}\` → \`${(after ?? "none").toString().slice(0, 480)}\``,
          inline: false,
        });
      }
    };

    push("Name", oldE?.name, newE.name);
    push("Description", oldE?.description, newE.description);
    push(
      "Status",
      STATUS[oldE?.status] ?? oldE?.status,
      STATUS[newE.status] ?? newE.status,
    );
    push(
      "Starts",
      oldE?.scheduledStartTimestamp
        ? `<t:${Math.floor(oldE.scheduledStartTimestamp / 1000)}:F>`
        : "none",
      newE.scheduledStartTimestamp
        ? `<t:${Math.floor(newE.scheduledStartTimestamp / 1000)}:F>`
        : "none",
    );
    push(
      "Location",
      oldE?.channelId ? `<#${oldE.channelId}>` : oldE?.entityMetadata?.location,
      newE.channelId ? `<#${newE.channelId}>` : newE.entityMetadata?.location,
    );

    if (!changes.length) return;

    const channel = await getAuditChannel(newE.guild, client);
    if (!channel) return;

    const embed = fkzEmbed()
      .setTitle("Scheduled Event Updated")
      .setFooter({ text: `FKZ • ID: ${newE.id}` })
      .addFields(changes);

    await channel
      .send({ embeds: [embed] })
      .catch((e) => console.error("GuildScheduledEventUpdate send failed:", e));
  },
};

const { EmbedBuilder, Events, AuditLogEvent } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");

// Only actions that have NO dedicated event handler of their own.
// This handler exists to add the "who did it" for ban/kick/prune/etc.
const REPORTED_ACTIONS = new Set([
  AuditLogEvent.MemberKick,
  AuditLogEvent.MemberPrune,
  AuditLogEvent.MemberBanAdd,
  AuditLogEvent.MemberBanRemove,
  AuditLogEvent.MemberMove,
  AuditLogEvent.MemberDisconnect,
  AuditLogEvent.BotAdd,
]);

// Turn the numeric action into a readable label, e.g. 22 -> "Member Ban Add".
function actionName(action) {
  const key = AuditLogEvent[action];
  if (!key) return `Unknown (${action})`;
  return key.replace(/([a-z])([A-Z])/g, "$1 $2");
}

// Stringify a single change value for the embed.
function fmt(value) {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) {
    if (!value.length) return "—";
    // Permission overwrite / role arrays come through as objects.
    return value
      .map((v) =>
        typeof v === "object" ? v.name || v.id || JSON.stringify(v) : v,
      )
      .join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

module.exports = {
  name: Events.GuildAuditLogEntryCreate,
  async execute(auditLogEntry, guild, client) {
    if (!guild) return;

    // Skip actions already covered by a dedicated handler.
    if (!REPORTED_ACTIONS.has(auditLogEntry.action)) return;

    const channel = await getAuditChannel(guild, client);
    if (!channel) return;

    const { action, executorId, targetId, reason, changes, extra } =
      auditLogEntry;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ • Audit ID: ${auditLogEntry.id}` })
      .setTitle("Audit Log Entry")
      .addFields({
        name: "Action",
        value: actionName(action),
        inline: true,
      });

    embed.addFields({
      name: "Executor",
      value: executorId ? `<@${executorId}>` : "Unknown",
      inline: true,
    });

    if (targetId) {
      embed.addFields({
        name: "Target",
        value: `\`${targetId}\``,
        inline: true,
      });
    }

    // Prune/disconnect/move carry a count (and sometimes a channel) in `extra`.
    const count = extra?.removed ?? extra?.count;
    if (count != null) {
      embed.addFields({
        name: "Count",
        value: `${count}`,
        inline: true,
      });
    }

    if (reason) {
      embed.addFields({
        name: "Reason",
        value: reason.slice(0, 1024),
        inline: false,
      });
    }

    if (Array.isArray(changes) && changes.length) {
      const text = changes
        .map((c) => `**${c.key}:** ${fmt(c.old)} → ${fmt(c.new)}`)
        .join("\n");
      if (text.trim()) {
        embed.addFields({
          name: "Changes",
          value: text.slice(0, 1024),
          inline: false,
        });
      }
    }

    try {
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in GuildAuditLogEntryCreate event:", error);
    }
  },
};

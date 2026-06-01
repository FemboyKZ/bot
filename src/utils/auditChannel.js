const schema = require("../schemas/baseSystem.js");

/**
 * Resolve the configured audit-log channel for a guild, or null if logging
 * isn't set up / the channel is gone. Shared by the event loggers so the
 * lookup boilerplate lives in one place.
 *
 * @param {import("discord.js").Guild | null | undefined} guild
 * @param {import("discord.js").Client} client
 * @returns {Promise<import("discord.js").GuildTextBasedChannel|null>}
 */
async function getAuditChannel(guild, client) {
  if (!guild) return null;
  const data = await schema.findOne({ Guild: guild.id, ID: "audit-logs" });
  if (!data || !data.Channel) return null;
  return client.channels.cache.get(data.Channel) || null;
}

module.exports = { getAuditChannel };

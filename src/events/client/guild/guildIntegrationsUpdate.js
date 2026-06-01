const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");

module.exports = {
  name: Events.GuildIntegrationsUpdate,
  async execute(guild, client) {
    if (!guild) return;

    const channel = await getAuditChannel(guild, client);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("Integrations Updated")
      .setFooter({ text: `FKZ • ID: ${guild.id}` })
      .setDescription(
        "A server integration was added, removed or changed. See the audit log for details.",
      );

    await channel
      .send({ embeds: [embed] })
      .catch((e) => console.error("GuildIntegrationsUpdate send failed:", e));
  },
};

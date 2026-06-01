const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");

module.exports = {
  name: Events.ApplicationCommandPermissionsUpdate,
  async execute(data, client) {
    // data: { guildId, id (command or app id), applicationId, permissions[] }
    if (!data?.guildId) return;
    const guild = client.guilds.cache.get(data.guildId);
    if (!guild) return;

    const channel = await getAuditChannel(guild, client);
    if (!channel) return;

    const TYPE = { 1: "Role", 2: "User", 3: "Channel" };
    const perms = (data.permissions || [])
      .map((p) => {
        const kind = TYPE[p.type] || "Target";
        const mention =
          p.type === 1
            ? `<@&${p.id}>`
            : p.type === 2
              ? `<@${p.id}>`
              : `<#${p.id}>`;
        return `${kind} ${mention}: ${p.permission ? "allowed" : "denied"}`;
      })
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("Command Permissions Updated")
      .setFooter({ text: `FKZ • ID: ${data.id}` })
      .addFields({
        name: "Permissions",
        value: (perms || "Reset to default").slice(0, 1024),
        inline: false,
      });

    await channel
      .send({ embeds: [embed] })
      .catch((e) =>
        console.error("ApplicationCommandPermissionsUpdate send failed:", e),
      );
  },
};

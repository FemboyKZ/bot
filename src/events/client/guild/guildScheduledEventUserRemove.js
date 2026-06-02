const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");

module.exports = {
  name: Events.GuildScheduledEventUserRemove,
  async execute(guildScheduledEvent, user, client) {
    const event = guildScheduledEvent;
    if (!event?.guild) return;

    const channel = await getAuditChannel(event.guild, client);
    if (!channel) return;

    const embed = fkzEmbed()
      .setTitle("Scheduled Event - User No Longer Interested")
      .setFooter({ text: `FKZ • ID: ${event.id}` })
      .addFields(
        {
          name: "User",
          value: `<@${user.id}> - \`${user.username}\``,
          inline: false,
        },
        { name: "Event", value: event.name || "Unknown", inline: false },
      );

    await channel
      .send({ embeds: [embed] })
      .catch((e) =>
        console.error("GuildScheduledEventUserRemove send failed:", e),
      );
  },
};

const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../Schemas/base-system.js");

module.exports = {
  name: Events.GuildUnavailable,
  async execute(guild, client) {
    // TODO: Implement the GuildUnavailable event
    /*
    const auditlogData = await schema.findOne({
      Guild: guild.id,
      ID: "audit-logs",
    });

    if (auditlogData) {
      const channel = await client.channels.cache.get(auditlogData.Channel);
      if (!auditlogData.Channel || !channel) return;
      const owner = await client.users.cache.get(guild.ownerId);

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Guild Unavailable.")
        .addFields([
          {
            name: "Server",
            value: `> ${guild.name}`,
          },
        ])
        .setTimestamp()
        .setFooter({ text: `Guild Unavailable - ${guild.id}` });

      try {
        await channel.send({ embeds: [embed] });
      } catch (error) {
        console.error("Error in GuildUpdate event:", error);
      }
    }
    */
  },
};

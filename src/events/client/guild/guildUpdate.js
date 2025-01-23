const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../schemas/base-system.js");

module.exports = {
  name: Events.GuildUpdate,
  async execute(oldGuild, newGuild, client) {
    // TODO: Implement the GuildUpdate event
    /*
    const auditlogData = await schema.findOne({
      Guild: newGuild.id,
      ID: "audit-logs",
    });

    if (auditlogData) {
      const channel = await client.channels.cache.get(auditlogData.Channel);
      if (!auditlogData.Channel || !channel) return;
      const owner = await client.users.cache.get(newGuild.ownerId);

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Guild Updated.")
        .addFields([
          {
            name: "Server",
            value: `> ${newGuild.name}`,
          },
          {
            name: "Server Membercount",
            value: `> ${newGuild.memberCount}`,
          },
          {
            name: "Server Owner",
            value: `> ${owner.username} / ${newGuild.ownerId}`,
          },
          {
            name: "Server Age",
            value: `> <t:${parseInt(newGuild.createdTimestamp / 1000)}:R>`,
          },
        ])
        .setTimestamp()
        .setFooter({ text: `Guild Updated - ${newGuild.id}` });

      try {
        await channel.send({ embeds: [embed] });
      } catch (error) {
        console.error("Error in GuildUpdate event:", error);
      }
    }
    */
  },
};

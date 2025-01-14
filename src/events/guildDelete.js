const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");

module.exports = {
  name: Events.GuildDelete,
  async execute(guild, client) {
    const data = await schema.findOne({
      Guild: guild.id,
      ID: "audit-logs",
    });

    if (data) {
      const channel = await client.channels.cache.get(data.Channel);
      if (!data.Channel || !channel) return;
      const owner = await client.users.cache.get(guild.ownerId);

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("FKZ Bot has left a server.")
        .addFields([
          {
            name: "Server",
            value: `> ${guild.name}`,
          },
          {
            name: "Server Membercount",
            value: `> ${guild.memberCount}`,
          },
          {
            name: "Server Owner",
            value: `> ${owner.username} / ${guild.ownerId}`,
          },
          {
            name: "Server Age",
            value: `> <t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
          },
        ])
        .setTimestamp()
        .setFooter({ text: `Guild Left - ${guild.id}` });
      try {
        await channel.send({ embeds: [embed] });
      } catch (error) {
        console.error("Error in GuildDelete event:", error);
      }
    }
  },
};

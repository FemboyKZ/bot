const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const logs = require("../../../schemas/events/guilds.js");
const { fkzEmbed } = require("../../../utils/embeds.js");

module.exports = {
  name: Events.GuildDelete,
  async execute(guild, client) {
    const channel = await getAuditChannel(guild, client);
    if (!channel) return;

    const owner = await client.users.fetch(guild.ownerId).catch(() => null);

    const logData = await logs.findOne({
      Guild: guild.id,
      User: guild.ownerId,
    });

    const embed = fkzEmbed()
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
          value: `> ${owner?.username || "Unknown"} / ${guild.ownerId}`,
        },
        {
          name: "Server Age",
          value: `> <t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
        },
      ])
      .setFooter({ text: `Guild Left - ${guild.id}` });

    try {
      if (logData) {
        await logs.deleteMany({ Guild: guild.id, User: guild.ownerId });
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in GuildDelete event:", error);
    }
  },
};

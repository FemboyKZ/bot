const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/threads.js");

module.exports = {
  name: Events.ThreadDelete,
  async execute(thread, client) {
    const auditlogData = await schema.findOne({
      Guild: thread.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: thread.guild.id,
      Thread: thread.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ • ID: ${thread.id}` })
      .setTitle("Thread Deleted")
      .addFields(
        {
          name: "Name",
          value: `${thread.name}`,
          inline: false,
        },
        {
          name: "Creator",
          value: `${thread.ownerId ? logData.User : "unknown"}`,
          inline: false,
        },
        {
          name: "Channel",
          value: `${thread.parent ? logData.Parent : "none"}`,
          inline: false,
        },
        {
          name: "Auto Archive Time",
          value: `${thread.autoArchiveDuration ? logData.Auto : "unknown"}`,
          inline: false,
        },
        {
          name: "Link",
          value: `${thread.url}`,
          inline: false,
        },
      );

    try {
      if (logData) {
        await logs.deleteMany({
          Guild: thread.guild.id,
          Thread: thread.id,
        });
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.log("Error in ThreadDelete event:", error);
    }
  },
};

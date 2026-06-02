const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");
const logs = require("../../../schemas/events/threads.js");

module.exports = {
  name: Events.ThreadDelete,
  async execute(thread, client) {
    const channel = await getAuditChannel(thread.guild, client);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: thread.guild.id,
      Thread: thread.id,
    });

    const embed = fkzEmbed()
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
          value: thread.ownerId
            ? `<@${thread.ownerId}>`
            : logData?.User
              ? `<@${logData.User}>`
              : "unknown",
          inline: false,
        },
        {
          name: "Channel",
          value: thread.parentId
            ? `<#${thread.parentId}>`
            : logData?.Parent
              ? `<#${logData.Parent}>`
              : "none",
          inline: false,
        },
        {
          name: "Auto Archive Time",
          value: `${thread.autoArchiveDuration || logData?.Auto || "unknown"}`,
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

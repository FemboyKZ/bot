const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");
const logs = require("../../../schemas/events/threads.js");

module.exports = {
  name: Events.ThreadCreate,
  async execute(thread, newlyCreated, client) {
    const channel = await getAuditChannel(thread.guild, client);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: thread.guild.id,
      Thread: thread.id,
    });

    const embed = fkzEmbed()
      .setFooter({ text: `FKZ • ID: ${thread.id}` })
      .setTitle("Thread Created")
      .addFields(
        {
          name: "Name",
          value: `${thread.name}`,
          inline: false,
        },
        {
          name: "Creator",
          value: thread.ownerId ? `<@${thread.ownerId}>` : "unknown",
          inline: false,
        },
        {
          name: "Channel",
          value: thread.parentId ? `<#${thread.parentId}>` : "none",
          inline: false,
        },
        {
          name: "Auto Archive Time",
          value: thread.autoArchiveDuration
            ? `${thread.autoArchiveDuration}`
            : "unknown",
          inline: false,
        },
        {
          name: "Link",
          value: `${thread.url}`,
          inline: false,
        },
      );

    try {
      if (!logData) {
        await logs.create({
          Guild: thread.guild.id,
          Thread: thread.id,
          Name: thread.name,
          User: thread.ownerId,
          Parent: thread.parentId,
          Auto: thread.autoArchiveDuration,
          Locked: thread.locked,
          Archived: thread.archived,
        });
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.log("Error in ThreadCreate event:", error);
    }
  },
};

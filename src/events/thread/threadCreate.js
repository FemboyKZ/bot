const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../Schemas/base-system.js");
const logs = require("../../Schemas/logger/threads.js");
const settings = require("../../Schemas/logger/settings.js");

module.exports = {
  name: Events.ThreadCreate,
  async execute(thread, client) {
    const settingsData = await settings.findOne({
      Guild: thread.guild.id,
    });
    if (settingsData.Threads === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

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
      .setTitle("Thread Created")
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
          value: `${thread.autoArchiveDuration}` || "unknown",
          inline: false,
        },
        {
          name: "Link",
          value: `${thread.url}`,
          inline: false,
        }
      );

    try {
      if (!logData && settingsData.Store === true) {
        await logs.create({
          Guild: thread.guild.id,
          Thread: thread.id,
          Name: thread.name,
          User: thread.ownerId,
          Parent: thread.parent,
          Auto: thread.autoArchiveDuration,
          Locked: thread.locked,
          Archived: thread.archived,
        });
      }
      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.log("Error in ThreadCreate event:", error);
    }
  },
};

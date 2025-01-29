const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/threads.js");

module.exports = {
  name: Events.ThreadUpdate,
  async execute(oldThread, newThread, client) {
    const auditlogData = await schema.findOne({
      Guild: oldThread.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: newThread.guild.id,
      Thread: newThread.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setFooter({ text: `FKZ • ID: ${newThread.id}` })
      .setTimestamp()
      .setTitle("Thread Edited");

    try {
      if (!logData) {
        await logs.create({
          Guild: newThread.guild.id,
          Thread: newThread.id,
          Name: newThread.name,
          User: newThread.ownerId,
          Parent: newThread.parent,
          Auto: newThread.autoArchiveDuration,
          Locked: newThread.locked,
          Archived: newThread.archived,
        });
      }

      if (oldThread.name !== newThread.name) {
        embed.addFields({
          name: "Name",
          value: `\`${oldThread.name}\` → \`${newThread.name}\``,
          inline: false,
        });
        if (logData) {
          await logs.findOneAndUpdate(
            {
              Guild: newThread.guild.id,
              Thread: newThread.id,
            },
            {
              Name: newThread.name,
            },
          );
        }
        await channel.send({ embeds: [embed] });
      }

      if (oldThread.archived !== newThread.archived) {
        if (
          oldThread.archived === null &&
          newThread.archived === null &&
          logData.Archived === null
        ) {
          return;
        }

        embed.addFields({
          name: "Archived",
          value: `\`${oldThread.archived ? logData.Archived : "none"}\` → \`${
            newThread.archived || "none"
          }\``,
          inline: false,
        });
        if (logData) {
          await logs.findOneAndUpdate(
            {
              Guild: newThread.guild.id,
              Thread: newThread.id,
            },
            {
              Archived: newThread.archived,
            },
          );
        }
        await channel.send({ embeds: [embed] });
      }

      if (oldThread.locked !== newThread.locked) {
        if (
          oldThread.locked === null &&
          newThread.locked === null &&
          logData.Locked === null
        ) {
          return;
        }

        embed.addFields({
          name: "Locked",
          value: `\`${oldThread.locked ? logData.Locked : "none"}\` → \`${
            newThread.locked || "none"
          }\``,
          inline: false,
        });
        if (logData) {
          await logs.findOneAndUpdate(
            {
              Guild: newThread.guild.id,
              Thread: newThread.id,
            },
            {
              Locked: newThread.locked,
            },
          );
        }
        await channel.send({ embeds: [embed] });
      }

      if (oldThread.autoArchiveDuration !== newThread.autoArchiveDuration) {
        if (
          oldThread.autoArchiveDuration === null &&
          newThread.autoArchiveDuration === null &&
          logData.Auto === null
        ) {
          return;
        }

        embed.addFields({
          name: "Auto Archive",
          value: `\`${oldThread.autoArchiveDuration}\` → \`${newThread.autoArchiveDuration}\``,
          inline: false,
        });
        if (logData) {
          await logs.findOneAndUpdate(
            {
              Guild: newThread.guild.id,
              Thread: newThread.id,
            },
            {
              Auto: newThread.autoArchiveDuration,
            },
          );
        }
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.log("Error in ThreadUpdate event:", error);
    }
  },
};

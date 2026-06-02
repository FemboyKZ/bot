const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const logs = require("../../../schemas/events/threads.js");
const { fkzEmbed } = require("../../../utils/embeds.js");

module.exports = {
  name: Events.ThreadUpdate,
  async execute(oldThread, newThread, client) {
    const channel = await getAuditChannel(oldThread.guild, client);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: newThread.guild.id,
      Thread: newThread.id,
    });

    const embed = fkzEmbed()
      .setFooter({ text: `FKZ • ID: ${newThread.id}` })
      .setTitle("Thread Edited");

    try {
      if (!logData) {
        await logs.create({
          Guild: newThread.guild.id,
          Thread: newThread.id,
          Name: newThread.name,
          User: newThread.ownerId,
          Parent: newThread.parentId,
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
        if (oldThread.archived == null && newThread.archived == null) {
          return;
        }

        embed.addFields({
          name: "Archived",
          value: `\`${oldThread.archived ?? "none"}\` → \`${
            newThread.archived ?? "none"
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
        if (oldThread.locked == null && newThread.locked == null) {
          return;
        }

        embed.addFields({
          name: "Locked",
          value: `\`${oldThread.locked ?? "none"}\` → \`${
            newThread.locked ?? "none"
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
          oldThread.autoArchiveDuration == null &&
          newThread.autoArchiveDuration == null
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

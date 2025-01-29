const { EmbedBuilder, Events, DMChannel } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/channels.js");

// TODO: update comapring to (db data !== newChannel data)

module.exports = {
  name: Events.ChannelUpdate,
  async execute(oldChannel, newChannel, client) {
    if (oldChannel === DMChannel || newChannel === DMChannel) return;
    const auditlogData = await schema.findOne({
      Guild: oldChannel.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const auditChannel = await client.channels.cache.get(auditlogData.Channel);
    if (!auditChannel) return;

    const logData = await logs.findOne({
      Guild: oldChannel.guild.id,
      Channel: oldChannel.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ • ID: ${newChannel.id}` });

    try {
      if (!logData) {
        await logs.create({
          Guild: newChannel.guild.id,
          Channel: newChannel.id,
          Name: newChannel.name,
          Type: newChannel.type,
          Parent: newChannel.parentId,
          Topic: newChannel.topic,
        });
      }

      if (oldChannel.name !== newChannel.name) {
        if (logData && logData.Name) {
          embed.addFields({
            name: "Name",
            value: `\`${oldChannel.name ? logData.Name : "none"}\` → \`${
              newChannel.name || "none"
            }\``,
            inline: false,
          });
        } else {
          embed.addFields({
            name: "Name",
            value: `\`${oldChannel.name || "none"}\` → \`${
              newChannel.name || "none"
            }\``,
            inline: false,
          });
        }
        if (logData) {
          await logs.findOneAndUpdate(
            { Guild: newChannel.guild.id, Channel: newChannel.id },
            {
              Name: newChannel.name,
            },
          );
        }
        await auditChannel.send({ embeds: [embed] });
      }

      if (oldChannel.parentId !== newChannel.parentId) {
        if (logData && logData.Parent) {
          embed.addFields({
            name: "Category",
            value: `\`${oldChannel.parentId ? logData.Parent : "none"}\` → \`${
              newChannel.parentId || "none"
            }\``,
            inline: false,
          });
        } else {
          embed.addFields({
            name: "Category",
            value: `\`${oldChannel.parentId || "none"}\` → \`${
              newChannel.parentId || "none"
            }\``,
            inline: false,
          });
        }
        if (logData) {
          await logs.findOneAndUpdate(
            { Guild: newChannel.guild.id, Channel: newChannel.id },
            {
              Parent: newChannel.parentId,
            },
          );
        }
        await auditChannel.send({ embeds: [embed] });
      }

      if (oldChannel.topic !== newChannel.topic) {
        if (logData && logData.Topic) {
          embed.addFields({
            name: "Topic",
            value: `\`${oldChannel.topic ? logData.Topic : "none"}\` → \`${
              newChannel.topic || "none"
            }\``,
            inline: false,
          });
        } else {
          embed.addFields({
            name: "Topic",
            value: `\`${oldChannel.topic || "none"}\` → \`${
              newChannel.topic || "none"
            }\``,
            inline: false,
          });
        }
        if (logData) {
          await logs.findOneAndUpdate(
            { Guild: newChannel.guild.id, Channel: newChannel.id },
            {
              Topic: newChannel.topic || null,
            },
          );
        }
        await auditChannel.send({ embeds: [embed] });
      }

      if (oldChannel.type !== newChannel.type) {
        if (logData && logData.Type) {
          embed.addFields({
            name: "Type",
            value: `\`${oldChannel.type ? logData.Type : "none"}\` → \`${
              newChannel.type || "none"
            }\``,
            inline: false,
          });
        } else {
          embed.addFields({
            name: "Type",
            value: `\`${oldChannel.type || "none"}\` → \`${
              newChannel.type || "none"
            }\``,
            inline: false,
          });
        }
        if (logData) {
          await logs.findOneAndUpdate(
            { Guild: newChannel.guild.id, Channel: newChannel.id },
            {
              Type: newChannel.type || null,
            },
          );
        }
        await auditChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.log("Error in ChannelUpdate event:", error);
    }
  },
};

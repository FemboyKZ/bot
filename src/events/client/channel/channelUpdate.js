const { EmbedBuilder, Events, DMChannel } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/channels.js");

module.exports = {
  name: Events.ChannelUpdate,
  async execute(oldChannel, newChannel, client) {
    if (oldChannel instanceof DMChannel || newChannel instanceof DMChannel)
      return;

    if (!oldChannel.guild || !newChannel.guild) return;

    try {
      const auditlogData = await schema.findOne({
        Guild: oldChannel.guild.id,
        ID: "audit-logs",
      });

      if (!auditlogData?.Channel) return;

      const auditChannel = client.channels.cache.get(auditlogData.Channel);
      if (!auditChannel) return;

      const logData = await logs.findOne({
        Guild: oldChannel.guild.id,
        Channel: oldChannel.id,
      });

      const embed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setTitle("Channel Updated")
        .setFooter({ text: `FKZ • ID: ${newChannel.id}` });

      const changes = [];
      const updateData = {};

      if (oldChannel.name !== newChannel.name) {
        const oldName = logData?.Name || oldChannel.name || "none";
        const newName = newChannel.name || "none";

        changes.push({
          name: "Name",
          value: `\`${oldName}\` → \`${newName}\``,
          inline: false,
        });
        updateData.Name = newChannel.name;
      }

      if (oldChannel.parentId !== newChannel.parentId) {
        const oldParent = logData?.Parent || oldChannel.parentId || "none";
        const newParent = newChannel.parentId || "none";

        changes.push({
          name: "Category",
          value: `\`${oldParent}\` → \`${newParent}\``,
          inline: false,
        });
        updateData.Parent = newChannel.parentId;
      }

      if (oldChannel.topic !== newChannel.topic) {
        const oldTopic = logData?.Topic || oldChannel.topic || "none";
        const newTopic = newChannel.topic || "none";

        changes.push({
          name: "Topic",
          value: `\`${oldTopic}\` → \`${newTopic}\``,
          inline: false,
        });
        updateData.Topic = newChannel.topic || null;
      }

      if (oldChannel.type !== newChannel.type) {
        const oldType = logData?.Type || oldChannel.type || "none";
        const newType = newChannel.type || "none";

        changes.push({
          name: "Type",
          value: `\`${oldType}\` → \`${newType}\``,
          inline: false,
        });
        updateData.Type = newChannel.type;
      }

      if (changes.length === 0) return;

      embed.addFields(changes);

      if (logData) {
        await logs.findOneAndUpdate(
          { Guild: newChannel.guild.id, Channel: newChannel.id },
          updateData,
        );
      } else {
        await logs.create({
          Guild: newChannel.guild.id,
          Channel: newChannel.id,
          Name: newChannel.name,
          Type: newChannel.type,
          Parent: newChannel.parentId,
          Topic: newChannel.topic,
          ...updateData,
        });
      }

      await auditChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in ChannelUpdate event:", error);
    }
  },
};

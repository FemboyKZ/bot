const { EmbedBuilder, Events, DMChannel } = require("discord.js");
const schema = require("../../../schemas/baseSystem.js");
const logs = require("../../../schemas/events/channels.js");

module.exports = {
  name: Events.ChannelCreate,
  async execute(channel, client) {
    if (channel === DMChannel) return;
    const auditlogData = await schema.findOne({
      Guild: channel.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const auditChannel = await client.channels.cache.get(auditlogData.Channel);
    if (!auditChannel) return;

    const logData = await logs.findOne({
      Guild: channel.guild.id,
      Channel: channel.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ • ID: ${channel.id}` })
      .setTitle("Channel Created")
      .addFields(
        {
          name: "Name",
          value: `${channel.name}`,
          inline: false,
        },
        {
          name: "Type",
          value: `${channel.type}`,
          inline: false,
        },
        {
          name: "Topic",
          value: `${channel.topic ? logData.Topic : "None"}`,
          inline: false,
        },
        {
          name: "Category",
          value: `${channel.parentId ? logData.Parent : "Unknown"}`,
          inline: false,
        },
      );
    try {
      if (logData) {
        await logs.findOneAndUpdate(
          { Guild: channel.guild.id, Channel: channel.id },
          {
            Name: channel.name,
            Topic: channel.topic,
            Parent: channel.parentId,
            Type: channel.type,
          },
        );
      }
      if (!logData) {
        await logs.create({
          Guild: channel.guild.id,
          Name: channel.name,
          Type: channel.type,
          Parent: channel.parentId,
          Channel: channel.id,
        });
      }

      await auditChannel.send({ embeds: [embed] });
    } catch (error) {
      console.log("Error in ChannelCreate event:", error);
    }
  },
};

const { EmbedBuilder, Events, DMChannel } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/channels.js");
const settings = require("../Schemas/logger/settings.js");

module.exports = {
  name: Events.ChannelCreate,
  async execute(channel, client) {
    const settingsData = await settings.findOne({
      Guild: channel.guild.id,
    });
    if (settingsData.Channels === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

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
        }
      );
    try {
      if (logData && settingsData.Store === true) {
        await logs.findOneAndUpdate(
          { Guild: channel.guild.id, Channel: channel.id },
          {
            Name: channel.name,
            Topic: channel.topic,
            Parent: channel.parentId,
            Type: channel.type,
          }
        );
      } else if (!logData && settingsData.Store === true) {
        await logs.create({
          Guild: channel.guild.id,
          Name: channel.name,
          Type: channel.type,
          Parent: channel.parentId,
          Channel: channel.id,
        });
      }

      if (settingsData.Post === true) {
        await auditChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.log("Error in ChannelCreate event:", error);
    }
  },
};

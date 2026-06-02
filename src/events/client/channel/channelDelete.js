const { Events, DMChannel } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");
const logs = require("../../../schemas/events/channels.js");

module.exports = {
  name: Events.ChannelDelete,
  async execute(channel, client) {
    if (channel instanceof DMChannel || !channel.guild) return;
    const auditChannel = await getAuditChannel(channel.guild, client);
    if (!auditChannel) return;

    const logData = await logs.findOne({
      Guild: channel.guild.id,
      Channel: channel.id,
    });

    const embed = fkzEmbed()
      .setFooter({ text: `FKZ • ID: ${channel.id}` })
      .setTitle("Channel Deleted")
      .addFields(
        {
          name: "Name",
          value: `${channel.name || logData?.Name || "Unknown"}`,
          inline: false,
        },
        {
          name: "Type",
          value: `${channel.type}`,
          inline: false,
        },
        {
          name: "Topic",
          value: (channel.topic || logData?.Topic || "No Topic").slice(0, 1024),
          inline: false,
        },
        {
          name: "Category",
          value: channel.parent
            ? `${channel.parent.name}`
            : logData?.Parent || "No Category",
          inline: false,
        },
      );

    try {
      if (logData) {
        await logs.deleteMany({ Guild: channel.guild.id, Channel: channel.id });
      }

      await auditChannel.send({ embeds: [embed] });
    } catch (error) {
      console.log("Error in ChannelDelete event:", error);
    }
  },
};

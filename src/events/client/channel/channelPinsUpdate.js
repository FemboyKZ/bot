const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");

module.exports = {
  name: Events.ChannelPinsUpdate,
  async execute(channel, _date, client) {
    // Discord doesn't say which message was (un)pinned,
    // only that the set changed in this channel.
    if (!channel?.guild) return;

    const auditChannel = await getAuditChannel(channel.guild, client);
    if (!auditChannel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("Channel Pins Updated")
      .setFooter({ text: `FKZ • ID: ${channel.id}` })
      .addFields({
        name: "Channel",
        value: `<#${channel.id}>`,
        inline: false,
      });

    await auditChannel
      .send({ embeds: [embed] })
      .catch((e) => console.error("ChannelPinsUpdate send failed:", e));
  },
};

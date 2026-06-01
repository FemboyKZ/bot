const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");

module.exports = {
  name: Events.StageInstanceCreate,
  async execute(stageInstance, client) {
    if (!stageInstance?.guild) return;

    const channel = await getAuditChannel(stageInstance.guild, client);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("Stage Started")
      .setFooter({ text: `FKZ • ID: ${stageInstance.id}` })
      .addFields(
        {
          name: "Topic",
          value: (stageInstance.topic || "none").slice(0, 1024),
          inline: false,
        },
        {
          name: "Channel",
          value: stageInstance.channelId
            ? `<#${stageInstance.channelId}>`
            : "Unknown",
          inline: false,
        },
      );

    await channel
      .send({ embeds: [embed] })
      .catch((e) => console.error("StageInstanceCreate send failed:", e));
  },
};

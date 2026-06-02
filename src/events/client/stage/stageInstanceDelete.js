const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");

module.exports = {
  name: Events.StageInstanceDelete,
  async execute(stageInstance, client) {
    if (!stageInstance?.guild) return;

    const channel = await getAuditChannel(stageInstance.guild, client);
    if (!channel) return;

    const embed = fkzEmbed()
      .setTitle("Stage Ended")
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
      .catch((e) => console.error("StageInstanceDelete send failed:", e));
  },
};

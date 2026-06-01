const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");

module.exports = {
  name: Events.StageInstanceUpdate,
  async execute(oldStageInstance, newStageInstance, client) {
    if (!newStageInstance?.guild) return;
    if (oldStageInstance?.topic === newStageInstance.topic) return;

    const channel = await getAuditChannel(newStageInstance.guild, client);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("Stage Updated")
      .setFooter({ text: `FKZ • ID: ${newStageInstance.id}` })
      .addFields(
        {
          name: "Channel",
          value: newStageInstance.channelId
            ? `<#${newStageInstance.channelId}>`
            : "Unknown",
          inline: false,
        },
        {
          name: "Topic",
          value: `\`${(oldStageInstance?.topic || "none").slice(0, 480)}\` → \`${(newStageInstance.topic || "none").slice(0, 480)}\``,
          inline: false,
        },
      );

    await channel
      .send({ embeds: [embed] })
      .catch((e) => console.error("StageInstanceUpdate send failed:", e));
  },
};

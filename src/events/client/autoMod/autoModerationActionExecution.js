const { Events, AutoModerationActionType } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");

const ACTION = {
  [AutoModerationActionType.BlockMessage]: "Block Message",
  [AutoModerationActionType.SendAlertMessage]: "Send Alert",
  [AutoModerationActionType.Timeout]: "Timeout",
};

module.exports = {
  name: Events.AutoModerationActionExecution,
  async execute(execution, client) {
    if (!execution?.guild) return;

    const channel = await getAuditChannel(execution.guild, client);
    if (!channel) return;

    const embed = fkzEmbed()
      .setTitle("AutoMod Action Executed")
      .setFooter({ text: `FKZ • Rule: ${execution.ruleId}` })
      .addFields(
        {
          name: "User",
          value: execution.userId ? `<@${execution.userId}>` : "Unknown",
          inline: true,
        },
        {
          name: "Action",
          value: ACTION[execution.action?.type] ?? "Unknown",
          inline: true,
        },
      );

    if (execution.channelId) {
      embed.addFields({
        name: "Channel",
        value: `<#${execution.channelId}>`,
        inline: true,
      });
    }

    const matched = execution.matchedKeyword || execution.matchedContent;
    if (matched) {
      embed.addFields({
        name: "Matched",
        value: `\`${matched.toString().slice(0, 1000)}\``,
        inline: false,
      });
    }

    if (execution.content) {
      embed.addFields({
        name: "Message Content",
        value: execution.content.slice(0, 1024),
        inline: false,
      });
    }

    await channel
      .send({ embeds: [embed] })
      .catch((e) =>
        console.error("AutoModerationActionExecution send failed:", e),
      );
  },
};

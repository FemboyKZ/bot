const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");
const logs = require("../../../schemas/events/automodRules.js");

// TODO: make this not shit

module.exports = {
  name: Events.AutoModerationRuleDelete,
  async execute(autoModerationRule, client) {
    const channel = await getAuditChannel(autoModerationRule.guild, client);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: autoModerationRule.guild.id,
      Rule: autoModerationRule.id,
    });

    const embed = fkzEmbed()
      .setTitle("Automod Rule Deleted")
      .setFooter({ text: `FKZ • ID: ${autoModerationRule.id}` })
      .addFields(
        {
          name: "Creator",
          value: `<@${autoModerationRule.creatorId}>`,
          inline: false,
        },
        {
          name: "Name",
          value: autoModerationRule.name || logData?.Name || "None",
          inline: false,
        },
        {
          name: "Trigger",
          value: `${autoModerationRule.triggerType ?? logData?.Trigger ?? "None"}`,
          inline: false,
        },
        {
          name: "Actions",
          value: `${autoModerationRule.actions?.[0]?.type ?? logData?.Action ?? "None"}`,
          inline: false,
        },
      );

    try {
      if (logData) {
        await logs.deleteMany({
          Guild: autoModerationRule.guild?.id,
          Rule: autoModerationRule.id,
        });
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in AutoModRuleDelete event:", error);
    }
  },
};

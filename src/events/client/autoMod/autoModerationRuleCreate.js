const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");
const logs = require("../../../schemas/events/automodRules.js");

// TODO: make this not shit

module.exports = {
  name: Events.AutoModerationRuleCreate,
  async execute(autoModerationRule, client) {
    const channel = await getAuditChannel(autoModerationRule.guild, client);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: autoModerationRule.guild.id,
      Rule: autoModerationRule.id,
    });

    const embed = fkzEmbed()
      .setTitle("Automod Rule Created")
      .setFooter({ text: `FKZ • ID: ${autoModerationRule.id}` })
      .addFields(
        {
          name: "Creator",
          value: `<@${autoModerationRule.creatorId}>`,
          inline: false,
        },
        {
          name: "Name",
          value: autoModerationRule.name || "None",
          inline: false,
        },
        {
          name: "Trigger",
          value: `${autoModerationRule.triggerType ?? "None"}`,
          inline: false,
        },
        {
          name: "Actions",
          value: `${autoModerationRule.actions?.[0]?.type ?? "None"}`,
          inline: false,
        },
      );

    try {
      if (!logData) {
        await logs.create({
          Guild: autoModerationRule.guild.id,
          Name: autoModerationRule.name,
          Rule: autoModerationRule.id,
          User: autoModerationRule.creatorId,
          Trigger: autoModerationRule.triggerType,
          Action: autoModerationRule.actions?.[0]?.type ?? null,
          Enabled: autoModerationRule.enabled,
        });
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in AutoModRuleCreate event:", error);
    }
  },
};

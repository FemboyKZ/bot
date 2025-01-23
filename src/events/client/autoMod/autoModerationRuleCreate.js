const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/automod.js");
const settings = require("../../../schemas/events/settings.js");

// TODO: make this not shit

module.exports = {
  name: Events.AutoModerationRuleCreate,
  async execute(autoModerationRule, client) {
    const settingsData = await settings.findOne({
      Guild: autoModerationRule.guild.id,
    });
    if (settingsData.Automod === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

    const auditlogData = await schema.findOne({
      Guild: autoModerationRule.guild?.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: autoModerationRule.guild.id,
      Rule: autoModerationRule.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
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
          value: autoModerationRule.name ? logData.Name : "None",
          inline: false,
        },
        {
          name: "Trigger",
          value: autoModerationRule.triggerType ? logData.Trigger : "None",
          inline: false,
        },
        {
          name: "Actions",
          value: autoModerationRule.actions[0].type ? logData.Action : "None",
          inline: false,
        }
      );

    try {
      if (!logData && settingsData.Store) {
        await logs.create({
          Guild: autoModerationRule.guild.id,
          Name: autoModerationRule.name,
          Rule: autoModerationRule.id,
          User: autoModerationRule.creatorId,
          Trigger: autoModerationRule.triggerType,
          Action: autoModerationRule.actions[0].type,
          Enabled: autoModerationRule.enabled,
        });
      }

      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error in AutoModRuleCreate event:", error);
    }
  },
};

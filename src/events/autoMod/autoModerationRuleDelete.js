const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../Schemas/base-system.js");
const logs = require("../../Schemas/logger/automod.js");
const settings = require("../../Schemas/logger/settings.js");

// TODO: make this not shit

module.exports = {
  name: Events.AutoModerationRuleDelete,
  async execute(rule, client) {
    const settingsData = await settings.findOne({
      Guild: rule.guild.id,
    });
    if (settingsData.Automod === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

    const auditlogData = await schema.findOne({
      Guild: rule.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: rule.guild.id,
      Rule: rule.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("Automod Rule Deleted")
      .setFooter({ text: `FKZ • ID: ${rule.id}` })
      .addFields(
        {
          name: "Creator",
          value: `<@${rule.creatorId}>`,
          inline: false,
        },
        {
          name: "Name",
          value: rule.name ? logData.Name : "None",
          inline: false,
        },
        {
          name: "Trigger",
          value: rule.triggerType ? logData.Trigger : "None",
          inline: false,
        },
        {
          name: "Actions",
          value: rule.actions[0].type ? logData.Action : "None",
          inline: false,
        }
      );

    try {
      if (logData && settingsData.Store === true) {
        await logs.deleteMany({ Guild: rule.guild?.id, Rule: rule.id });
      }

      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error in AutoModRuleDelete event:", error);
    }
  },
};

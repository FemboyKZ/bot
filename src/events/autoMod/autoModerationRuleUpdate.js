const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../Schemas/base-system.js");
const logs = require("../../Schemas/logger/automod.js");
const settings = require("../../Schemas/logger/settings.js");

// TODO: make this not shit

module.exports = {
  name: Events.AutoModerationRuleUpdate,
  async execute(oldAutoModerationRule, newAutoModerationRule, client) {
    const settingsData = await settings.findOne({
      Guild: newAutoModerationRule.guild.id,
    });
    if (settingsData.Automod === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

    const auditlogData = await schema.findOne({
      Guild: newAutoModerationRule.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("Automod Rule Updated")
      .setFooter({ text: `FKZ • ID: ${newAutoModerationRule.id}` });

    const logData = await logs.findOne({
      Guild: newAutoModerationRule.guild.id,
      Rule: newAutoModerationRule.id,
    });

    try {
      if (!logData && settingsData.Store === true) {
        await logs.create({
          Guild: newAutoModerationRule.guild.id,
          Name: newAutoModerationRule.name,
          Rule: newAutoModerationRule.id,
          User: newAutoModerationRule.creatorId,
          Trigger: newAutoModerationRule.triggerType,
          Action: newAutoModerationRule.actions[0].type,
          Enabled: newAutoModerationRule.enabled,
        });
      }

      if (oldAutoModerationRule.name !== newAutoModerationRule.name) {
        embed.addFields({
          name: "Name",
          value: `\`${
            oldAutoModerationRule.name ? logData.Name : "None"
          }\`  →  \`${newAutoModerationRule.name || "None"}\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            {
              Guild: newAutoModerationRule.guild?.id,
              Rule: newAutoModerationRule.id,
            },
            { Name: newAutoModerationRule.name }
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldAutoModerationRule.actions !== newAutoModerationRule.actions) {
        embed.addFields(
          {
            name: "Old Rules",
            value: oldAutoModerationRule.actions[0].type
              ? logData.Action
              : "None",
            inline: false,
          },
          {
            name: "New Rules",
            value: newAutoModerationRule.actions[0].type || "None",
            inline: false,
          }
        );
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            {
              Guild: newAutoModerationRule.guild?.id,
              Rule: newAutoModerationRule.id,
            },
            { Action: newAutoModerationRule.actions[0].type }
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldAutoModerationRule.enabled !== newAutoModerationRule.enabled) {
        embed.addFields({
          name: "Enabled?",
          value: `\`${
            oldAutoModerationRule.enabled ? logData.Enabled : "Unknown"
          }\`  →  \`${newAutoModerationRule.enabled || "Unknown"}\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            {
              Guild: newAutoModerationRule.guild?.id,
              Rule: newAutoModerationRule.id,
            },
            { Enabled: newAutoModerationRule.enabled }
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (
        oldAutoModerationRule.triggerType !== newAutoModerationRule.triggerType
      ) {
        embed.addFields({
          name: "Trigger",
          value: `\`${
            oldAutoModerationRule.triggerType ? logData.Trigger : "None"
          }\`  →  \`${newAutoModerationRule.triggerType || "None"}\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            {
              Guild: newAutoModerationRule.guild?.id,
              Rule: newAutoModerationRule.id,
            },
            { Trigger: newAutoModerationRule.triggerType }
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error("Error in AutoModRuleUpdate event:", error);
    }
  },
};

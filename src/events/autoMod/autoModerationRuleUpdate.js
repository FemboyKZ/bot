const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../Schemas/base-system.js");
const logs = require("../../Schemas/logger/automod.js");
const settings = require("../../Schemas/logger/settings.js");

// TODO: make this not shit

module.exports = {
  name: Events.AutoModerationRuleUpdate,
  async execute(oldRule, newRule, client) {
    const settingsData = await settings.findOne({
      Guild: newRule.guild.id,
    });
    if (settingsData.Automod === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

    const auditlogData = await schema.findOne({
      Guild: newRule.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("Automod Rule Updated")
      .setFooter({ text: `FKZ • ID: ${newRule.id}` });

    const logData = await logs.findOne({
      Guild: newRule.guild.id,
      Rule: newRule.id,
    });

    try {
      if (!logData && settingsData.Store === true) {
        await logs.create({
          Guild: newRule.guild.id,
          Name: newRule.name,
          Rule: newRule.id,
          User: newRule.creatorId,
          Trigger: newRule.triggerType,
          Action: newRule.actions[0].type,
          Enabled: newRule.enabled,
        });
      }

      if (oldRule.name !== newRule.name) {
        embed.addFields({
          name: "Name",
          value: `\`${oldRule.name ? logData.Name : "None"}\`  →  \`${
            newRule.name || "None"
          }\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: newRule.guild?.id, Rule: newRule.id },
            { Name: newRule.name }
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldRule.actions !== newRule.actions) {
        embed.addFields(
          {
            name: "Old Rules",
            value: oldRule.actions[0].type ? logData.Action : "None",
            inline: false,
          },
          {
            name: "New Rules",
            value: newRule.actions[0].type || "None",
            inline: false,
          }
        );
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: newRule.guild?.id, Rule: newRule.id },
            { Action: newRule.actions[0].type }
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldRule.enabled !== newRule.enabled) {
        embed.addFields({
          name: "Enabled?",
          value: `\`${oldRule.enabled ? logData.Enabled : "Unknown"}\`  →  \`${
            newRule.enabled || "Unknown"
          }\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: newRule.guild?.id, Rule: newRule.id },
            { Enabled: newRule.enabled }
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldRule.triggerType !== newRule.triggerType) {
        embed.addFields({
          name: "Trigger",
          value: `\`${oldRule.triggerType ? logData.Trigger : "None"}\`  →  \`${
            newRule.triggerType || "None"
          }\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: newRule.guild?.id, Rule: newRule.id },
            { Trigger: newRule.triggerType }
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

const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/automod.js");
const settings = require("../Schemas/logger/settings.js");
const { client } = require("../index.js");

client.on(Events.AutoModerationRuleCreate, async (rule) => {
  const settingsData = await settings.findOne({
    Guild: rule.guild.id,
  });
  if (settingsData.Automod === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: rule.guild?.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    Guild: rule.guild.id,
    Rule: rule.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setTitle("Automod Rule Created")
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
    if (!logData && settingsData.Store) {
      await logs.create({
        Guild: rule.guild.id,
        Name: rule.name,
        Rule: rule.id,
        User: rule.creatorId,
        Trigger: rule.triggerType,
        Action: rule.actions[0].type,
        Enabled: rule.enabled,
      });
    }

    if (settingsData.Post === true) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Error in AutoModRuleCreate event:", error);
  }
});

client.on(Events.AutoModerationRuleDelete, async (rule) => {
  const settingsData = await settings.findOne({
    Guild: rule.guild.id,
  });
  if (settingsData.Automod === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: rule.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

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
});

client.on(Events.AutoModerationRuleUpdate, async (oldRule, newRule) => {
  const settingsData = await settings.findOne({
    Guild: rule.guild.id,
  });
  if (settingsData.Automod === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: newRule.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

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
});

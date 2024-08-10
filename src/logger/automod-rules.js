const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/automod.js");
const { client } = require("../index.js");

client.on(Events.AutoModerationRuleCreate, async (rule) => {
  const data = await schema.findOne({
    Guild: rule.guild?.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    Guild: rule.guild?.id,
    Rule: rule.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setTitle("Automod Rule Created")
    .setFooter({ text: `FKZ • ID: ${rule.id}` })
    .addFields(
      {
        name: "Creator:",
        value: `<@${rule.creatorId}>`,
        inline: false,
      },
      {
        name: "Name:",
        value: rule.name ? logData.Name : "None",
        inline: false,
      },
      {
        name: "Trigger:",
        value: rule.triggerType ? logData.Trigger : "None",
        inline: false,
      },
      {
        name: "Actions:",
        value: rule.actions[0].type ? logData.Action : "None",
        inline: false,
      }
    );

  try {
    if (logData) {
      await logs.findOneAndUpdate(
        { Guild: rule.guild?.id, Rule: rule.id },
        {
          Name: rule.name,
          Trigger: rule.triggerType,
          Action: rule.actions[0].type,
          Enabled: rule.enabled,
        }
      );
    } else {
      await logs.create({
        Guild: rule.guild?.id,
        Name: rule.name,
        Rule: rule.id,
        User: rule.creatorId,
        Trigger: rule.triggerType,
        Action: rule.actions[0].type,
        Enabled: rule.enabled,
      });
    }
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error in AutoModRuleCreate event:", error);
  }
});

client.on(Events.AutoModerationRuleDelete, async (rule) => {
  const data = await schema.findOne({
    Guild: rule.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    Guild: rule.guild?.id,
    Rule: rule.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setTitle("Automod Rule Deleted")
    .setFooter({ text: `FKZ • ID: ${rule.id}` })
    .addFields(
      {
        name: "Creator:",
        value: `<@${rule.creatorId}>`,
        inline: false,
      },
      {
        name: "Name:",
        value: rule.name ? logData.Name : "None",
        inline: false,
      },
      {
        name: "Trigger:",
        value: rule.triggerType ? logData.Trigger : "None",
        inline: false,
      },
      {
        name: "Actions:",
        value: rule.actions[0].type ? logData.Action : "None",
        inline: false,
      }
    );

  try {
    if (logData) {
      await logs.deleteMany({ Guild: rule.guild?.id, Rule: rule.id });
    }
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error in AutoModRuleDelete event:", error);
  }
});

client.on(Events.AutoModerationRuleUpdate, async (oldRule, newRule) => {
  const data = await schema.findOne({
    Guild: newRule.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const changes = [];

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setTitle("Automod Rule Updated")
    .setFooter({ text: `FKZ • ID: ${oldRule.id}` });

  const logData = await logs.findOne({
    Guild: newRule.guild?.id,
    Rule: newRule.id,
  });

  try {
    if (oldRule.name !== newRule.name) {
      changes.push(
        `Name: \`${oldRule.name ? logData.Name : "None"}\`  →  \`${
          newRule.name || "None"
        }\``
      );
      const changesText = changes.join("\n");
      embed.addFields({
        name: "Name Updated.",
        value: changesText,
      });
      await channel.send({ embeds: [embed] });
      await logs.findOneAndUpdate(
        { Guild: newRule.guild?.id, Rule: newRule.id },
        { Name: newRule.name }
      );
    }

    if (oldRule.actions !== newRule.actions) {
      embed.addFields(
        {
          name: "Old Rules:",
          value: oldRule.actions[0].type ? logData.Action : "None",
          inline: false,
        },
        {
          name: "New Rules:",
          value: newRule.actions[0].type || "None",
          inline: false,
        }
      );
      await channel.send({ embeds: [embed] });
      await logs.findOneAndUpdate(
        { Guild: newRule.guild?.id, Rule: newRule.id },
        { Action: newRule.actions[0].type }
      );
    }

    if (oldRule.enabled !== newRule.enabled) {
      embed.addFields({
        name: "Enabled?:",
        value: `\`${oldRule.enabled ? logData.Enabled : "Unknown"}\`  →  \`${
          newRule.enabled || "Unknown"
        }\``,
        inline: false,
      });
      await channel.send({ embeds: [embed] });
      await logs.findOneAndUpdate(
        { Guild: newRule.guild?.id, Rule: newRule.id },
        { Enabled: newRule.enabled }
      );
    }

    if (oldRule.triggerType !== newRule.triggerType) {
      embed.addFields({
        name: "Trigger:",
        value: `\`${oldRule.triggerType ? logData.Trigger : "None"}\`  →  \`${
          newRule.triggerType || "None"
        }\``,
        inline: false,
      });
      await channel.send({ embeds: [embed] });
      await logs.findOneAndUpdate(
        { Guild: newRule.guild?.id, Rule: newRule.id },
        { Trigger: newRule.triggerType }
      );
    }
  } catch (error) {
    console.error("Error in AutoModRuleUpdate event:", error);
  }
});

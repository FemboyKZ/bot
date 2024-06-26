const { EmbedBuilder, Events } = require("discord.js");
const Audit_Log = require("../Schemas/auditlog.js");
const { client } = require("../index.js");

client.on(Events.AutoModerationRuleCreate, async (autoModerationRule) => {
  try {
    const data = await Audit_Log.findOne({
      Guild: autoModerationRule.guild?.id,
    });
    if (!data) return;

    const logID = data.Channel;
    if (!logID) return;

    const auditChannel = client.channels.cache.get(logID);
    if (!auditChannel) return;

    let actions = JSON.stringify(autoModerationRule.actions);

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Automod Rule Created")
      .addFields(
        {
          name: "Creator:",
          value: `<@${autoModerationRule.creatorId}>`,
          inline: false,
        },
        {
          name: "Name:",
          value: autoModerationRule.name || "none",
          inline: false,
        },
        {
          name: "Actions:",
          value: actions,
          inline: false,
        }
      );
    await auditChannel.send({ embeds: [auditEmbed] });
  } catch (error) {
    console.error("Error in AutoModerationRuleCreate event:", error);
  }
});

client.on(Events.AutoModerationRuleDelete, async (autoModerationRule) => {
  try {
    const data = await Audit_Log.findOne({
      Guild: autoModerationRule.guild.id,
    });
    if (!data) return;

    let logID = data.Channel;
    if (!logID) return;

    const auditChannel = client.channels.cache.get(logID);
    if (!auditChannel) return;

    let actions = JSON.stringify(autoModerationRule.actions);

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Automod Rule Deleted")
      .addFields(
        {
          name: "Creator:",
          value: `<@${autoModerationRule.creatorId}>`,
          inline: false,
        },
        {
          name: "Name:",
          value: `${autoModerationRule.name}`,
          inline: false,
        },
        {
          name: "Actions:",
          value: `${actions}`,
          inline: false,
        }
      );
    await auditChannel.send({ embeds: [auditEmbed] });
  } catch (error) {
    console.error("Error in AutoModerationRuleDelete event:", error);
  }
});

client.on(
  Events.AutoModerationRuleUpdate,
  async (oldAutoModerationRule, newAutoModerationRule) => {
    try {
      const data = await Audit_Log.findOne({
        Guild: newAutoModerationRule.guild.id,
      });
      if (!data) return;

      const logID = data.Channel;
      if (!logID) return;

      const auditChannel = client.channels.cache.get(logID);
      if (!auditChannel) return;

      const changes = [];

      const auditEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setFooter({ text: "FKZ Log System" })
        .setTitle("Automod Rule Updated");

      if (oldAutoModerationRule.name !== newAutoModerationRule.name) {
        changes.push(
          `Name: \`${oldAutoModerationRule.name || "None"}\`  →  \`${
            newAutoModerationRule.name || "None"
          }\``
        );
        const changesText = changes.join("\n");
        auditEmbed.addFields({
          name: "Name Updated.",
          value: changesText,
        });
        await auditChannel.send({ embeds: [auditEmbed] });
      }

      if (oldAutoModerationRule.actions !== newAutoModerationRule.actions) {
        let oldActions =
          JSON.stringify(oldAutoModerationRule.actions) || "none";
        let newActions =
          JSON.stringify(newAutoModerationRule.actions) || "none";
        auditEmbed.addFields(
          {
            name: "Old Rules:",
            value: oldActions,
            inline: false,
          },
          {
            name: "New Rules:",
            value: newActions,
            inline: false,
          }
        );
        await auditChannel.send({ embeds: [auditEmbed] });
      }

      if (oldAutoModerationRule.enabled !== newAutoModerationRule.enabled) {
        auditEmbed.addFields({
          name: "Enabled?:",
          value: `\`${oldAutoModerationRule.enabled || "Unknown"}\`  →  \`${
            newAutoModerationRule.enabled || "Unknown"
          }\``,
          inline: false,
        });
        await auditChannel.send({ embeds: [auditEmbed] });
      }
    } catch (error) {
      console.error(error);
    }
  }
);

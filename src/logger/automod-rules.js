const { EmbedBuilder, Events } = require("discord.js");
const Audit_Log = require("./Schemas/auditlog");
const { client } = require("./index.js");

client.on(Events.AutoModerationRuleCreate, async (autoModerationRule) => {
  if (!autoModerationRule) {
    console.error("AutoModerationRuleCreate event received with no rule");
    return;
  }

  try {
    const data = await Audit_Log.findOne({
      Guild: autoModerationRule.guild?.id,
    });
    if (!data) {
      console.error("No audit log data found for guild");
      return;
    }

    const logID = data.Channel;
    if (!logID) {
      console.error("No log channel ID found in audit log data");
      return;
    }

    const auditChannel = client.channels.cache.get(logID);
    if (!auditChannel) {
      console.error("Audit log channel not found in cache");
      return;
    }

    const actions = autoModerationRule.actions?.toString() || "none";

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
    let logID;
    if (data) {
      logID = data.Channel;
    } else {
      console.error("No audit log data found for guild");
      return;
    }
    const auditChannel = client.channels.cache.get(logID);
    let actions = autoModerationRule.actions.toString();

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
    if (!oldAutoModerationRule || !newAutoModerationRule) {
      throw new Error("Param cannot be null");
    }

    const data = await Audit_Log.findOne({
      Guild: newAutoModerationRule.guild.id,
    });
    if (!data) {
      throw new Error("No audit log data found for guild");
    }

    const logID = data.Channel;
    if (!logID) {
      throw new Error("No log channel ID found in audit log data");
    }

    const auditChannel = client.channels.cache.get(logID);
    if (!auditChannel) {
      throw new Error("Audit log channel not found in cache");
    }

    const changes = [];

    const nullEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Automod Rule Updated")
      .addFields({
        name: "Changes:",
        value: `NULL`,
      });

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
        value: changesText || "null",
      });
      await auditChannel.send({ embeds: [auditEmbed] });
    }

    if (oldAutoModerationRule.actions !== newAutoModerationRule.actions) {
      let oldActions = oldAutoModerationRule.actions?.toString() || "none";
      let newActions = newAutoModerationRule.actions?.toString() || "none";
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
  }
);

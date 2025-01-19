const { EmbedBuilder, Events, isWebhookMessage } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/messages.js");
const settings = require("../Schemas/logger/settings.js");

module.exports = {
  name: Events.MessageDelete,
  async execute(message, client) {
    const settingsData = await settings.findOne({
      Guild: message.guild.id,
    });
    if (
      settingsData.Messages === false ||
      (settingsData.Store === false && settingsData.Post === false)
    )
      return;

    try {
      if (message.partial && message.partial === true) await message.fetch();
    } catch (error) {
      console.log(error);
    }

    if (!message.guild) return;
    if (message.webhookId !== null || message.author === client.user) return;
    if (!message.content || message.content.length === 0) return;

    const auditlogData = await schema.findOne({
      Guild: message.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: message.guild.id,
      Message: message.id,
    });

    const date = new Date();

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ • ID: ${message.id}` })
      .setTitle("Message Deleted")
      .addFields({
        name: "Author",
        value: `<@${message.author.id}> - \`${message.author.username}\``,
        inline: true,
      });

    try {
      if (message.content.length === 0 || message.content.length > 512) {
        if (!logData && settingsData.Store === true) {
          await logs.create({
            Guild: message.guild.id,
            User: message.author.id,
            Channel: message.channel.id,
            Message: message.id,
            Content: ["Deleted Message Too long to Log."],
            Images: message.attachments.map((attachment) => attachment.url),
            Created: message.createdAt,
            Deleted: date,
            Edited: null,
            Edits: 0,
          });
        } else if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: message.guild.id, Message: message.id },
            {
              $push: {
                Content: {
                  $each: ["Deleted Message Too long to Log."],
                },
              },
              Deleted: date,
            }
          );
        }
        embed.addFields({
          name: "Content",
          value: `\`Message Too long to Log.\``,
          inline: false,
        });
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
        return;
      } else {
        if (!logData && settingsData.Store === true) {
          await logs.create({
            Guild: message.guild.id,
            User: message.author.id,
            Channel: message.channel.id,
            Message: message.id,
            Content: [message.content || "Deleted Message Failed to Log."],
            Images: message.attachments.map((attachment) => attachment.url),
            Created: message.createdAt,
            Deleted: date,
            Edited: null,
            Edits: 0,
          });
          embed.addFields({
            name: "Deleted Message",
            value: `\`\`\`${message.content || "Unknown."}\`\`\``,
            inline: false,
          });
          if (settingsData.Post === true) {
            await channel.send({ embeds: [embed] });
          }
          return;
        } else if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: message.guild.id, Message: message.id },
            {
              $push: {
                Content: {
                  $each: [message.content || "Deleted Message Failed to Log."],
                },
              },
              Deleted: date,
            }
          );
          if (logData.Edits > 0) {
            const count = logData.Edits + 1;
            embed.addFields({
              name: "Deleted Message",
              value: `\`\`\`${
                message.content ? logData.Content[count] : "Unknown."
              }\`\`\``,
              inline: false,
            });
            if (settingsData.Post === true) {
              await channel.send({ embeds: [embed] });
            }
            return;
          } else {
            embed.addFields({
              name: "Deleted Message",
              value: `\`\`\`${message.content || "Unknown."}\`\`\``,
              inline: false,
            });
            if (settingsData.Post === true) {
              await channel.send({ embeds: [embed] });
            }
            return;
          }
        }
      }
    } catch (error) {
      console.log("Error in MessageDelete event:", error);
    }
  },
};

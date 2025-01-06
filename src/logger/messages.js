const { EmbedBuilder, Events, isWebhookMessage } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/messages.js");
const settings = require("../Schemas/logger/settings.js");
const { client } = require("../index.js");

client.on(Events.MessageDelete, async (message) => {
  const settingsData = await settings.findOne({
    Guild: message.guild.id,
  });
  if (settingsData.Messages === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  try {
    if (message.partial === true) await message.fetch();
  } catch (error) {
    console.log(error);
  }

  if (!message.guild) return;
  if (message.webhookId !== null || message.author === client.user) return;
  if (!message.content || message.content.length === 0) return;

  const data = await schema.findOne({
    Guild: message.guild.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
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
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  const settingsData = await settings.findOne({
    Guild: newMessage.guild.id,
  });
  if (
    (settingsData.Messages && settingsData.Messages === false) ||
    (settingsData.Store && settingsData.Store === false) ||
    (settingsData.Post && settingsData.Post === false)
  )
    return;

  if (newMessage.partial && newMessage.partial === true)
    await newMessage.fetch();
  if (oldMessage.partial && oldMessage.partial === true)
    await oldMessage.fetch();

  if (!newMessage.guild) return;
  if (oldMessage.webhookId !== null || newMessage.webhookId !== null) return;
  if (oldMessage.author === client.user || newMessage.author === client.user)
    return;

  if (oldMessage.content === newMessage.content) return;

  const data = await schema.findOne({
    Guild: newMessage.guild.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
  if (!channel) return;

  const logData = await logs.findOne({
    Guild: newMessage.guild.id,
    Message: newMessage.id,
  });

  const date = new Date();

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ • ID: ${newMessage.id}` })
    .setTitle("Message Edited")
    .addFields({
      name: "Author",
      value: `<@${newMessage.author.id}> - \`${newMessage.author.username}\``,
      inline: true,
    });

  try {
    if (
      oldMessage.content !== null &&
      newMessage.content !== null &&
      (oldMessage.content.length === 0 ||
        newMessage.content.length === 0 ||
        oldMessage.content.length > 512 ||
        newMessage.content.length > 512)
    ) {
      if (!logData && settingsData.Store === true) {
        await logs.create({
          Guild: newMessage.guild.id,
          User: newMessage.author.id,
          Channel: newMessage.channel.id,
          Message: newMessage.id,
          Content: ["Edited Message Too long to Log."],
          Images: oldMessage.attachments.map((attachment) => attachment.url),
          Created: oldMessage.createdAt,
          Edited: newMessage.editedAt || date,
          Deleted: null,
          Edits: 1,
        });
        embed.addFields({
          name: "Edited Message",
          value: `\`Message Too Long or null.\``,
          inline: false,
        });
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
        return;
      } else if (logData && settingsData.Store === true) {
        await logs.findOneAndUpdate(
          { Guild: newMessage.guild.id, Message: newMessage.id },
          {
            $push: {
              Content: {
                $each: ["Edited Message Too long to Log."],
              },
            },
            Edited: newMessage.editedAt,
            Edits: logData.Edits + 1,
          }
        );
      }
      embed.addFields({
        name: "Edited Message",
        value: `\`Message Too Long or null.\``,
        inline: false,
      });
      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
      return;
    } else {
      if (!logData && settingsData.Store === true) {
        await logs.create({
          Guild: newMessage.guild.id,
          User: newMessage.author.id,
          Channel: newMessage.channel.id,
          Message: newMessage.id,
          Content: [oldMessage.content || "Edited Message Failed to Log."],
          Images: oldMessage.attachments.map((attachment) => attachment.url),
          Created: oldMessage.createdAt,
          Edited: newMessage.editedAt || date,
          Deleted: null,
          Edits: 1,
        });
        embed.addFields({
          name: "Edited Message",
          value: `\`\`\`${oldMessage.content || "Unknown."}\`\`\` → \`\`\`${
            newMessage.content || "Unknown."
          }\`\`\``,
          inline: false,
        });
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
        return;
      } else if (logData && settingsData.Store === true) {
        await logs.findOneAndUpdate(
          { Guild: newMessage.guild.id, Message: newMessage.id },
          {
            $push: {
              Content: {
                $each: [oldMessage.content || "Edited Message Failed to Log."],
              },
            },
            Edited: newMessage.editedAt,
            Edits: logData.Edits + 1,
          }
        );
        embed.addFields({
          name: "Edited Message",
          value: `\`\`\`${
            oldMessage.content ? logData.Content[0] : "Unknown."
          }\`\`\` → \`\`\`${newMessage.content || "Unknown."}\`\`\``,
          inline: false,
        });
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
        return;
      }
    }
  } catch (error) {
    console.log("Error in MessageEdit event:", error);
  }
});

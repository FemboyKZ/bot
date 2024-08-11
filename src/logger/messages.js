const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/messages.js");
const { client } = require("../index.js");

client.on(Events.MessageDelete, async (message) => {
  const fullMessage = await message.fetch();
  if (!message.guild || !fullMessage.guild) return;

  const data = await schema.findOne({
    Guild: message.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

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
    if (
      message.content.length === 0 ||
      fullMessage.content.length === 0 ||
      message.content.length > 512 ||
      fullMessage.content.length > 512
    ) {
      if (!logData) {
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
      } else if (logData) {
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
    } else {
      if (!logData) {
        await logs.create({
          Guild: message.guild.id,
          User: message.author.id,
          Channel: message.channel.id,
          Message: message.id,
          Content: [
            message.content
              ? fullMessage.content
              : "Deleted Message Failed to Log.",
          ],
          Images: message.attachments.map((attachment) => attachment.url),
          Created: message.createdAt,
          Deleted: date,
          Edited: null,
          Edits: 0,
        });
        embed.addFields({
          name: "Deleted Message",
          value: `\`\`\`${
            message.content ? fullMessage.content : "Unknown."
          }\`\`\``,
          inline: false,
        });
      } else if (logData) {
        await logs.findOneAndUpdate(
          { Guild: message.guild.id, Message: message.id },
          {
            $push: {
              Content: {
                $each: [
                  message.content
                    ? fullMessage.content
                    : "Deleted Message Failed to Log.",
                ],
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
              message.content ? fullMessage.content : logData.Content[count]
            }\`\`\``,
            inline: false,
          });
        } else {
          embed.addFields({
            name: "Deleted Message",
            value: `\`\`\`${
              message.content ? fullMessage.content : logData.Content[0]
            }\`\`\``,
            inline: false,
          });
        }
      }
    }
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.log("Error in MessageDelete event:", error);
  }
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  const fullNewMessage = await newMessage.fetch();
  const fullOldMessage = await oldMessage.fetch();
  if (!newMessage.guild) return;
  const data = await schema.findOne({
    Guild: newMessage.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

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
      oldMessage.content.length === 0 ||
      newMessage.content.length === 0 ||
      fullOldMessage.content.length === 0 ||
      fullNewMessage.content.length === 0 ||
      oldMessage.content.length > 512 ||
      newMessage.content.length > 512 ||
      fullOldMessage.content.length > 512 ||
      fullNewMessage.content.length > 512
    ) {
      if (!logData) {
        await logs.create({
          Guild: newMessage.guild.id,
          User: newMessage.author.id || fullNewMessage.author.id,
          Channel: newMessage.channel.id,
          Message: newMessage.id,
          Content: ["Edited Message Too long to Log."],
          Images: oldMessage.attachments.map((attachment) => attachment.url),
          Created: oldMessage.createdAt || fullOldMessage.createdAt,
          Edited: newMessage.editedAt ? fullNewMessage.editedAt : date,
          Deleted: null,
          Edits: 1,
        });
      } else if (logData) {
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
    } else {
      if (!logData) {
        await logs.create({
          Guild: newMessage.guild.id,
          User: newMessage.author.id || fullNewMessage.author.id,
          Channel: newMessage.channel.id,
          Message: newMessage.id,
          Content: [
            oldMessage.content
              ? fullOldMessage.content
              : "Edited Message Failed to Log.",
          ],
          Images: oldMessage.attachments.map((attachment) => attachment.url),
          Created: oldMessage.createdAt || fullOldMessage.createdAt,
          Edited: newMessage.editedAt ? fullNewMessage.editedAt : date,
          Deleted: null,
          Edits: 1,
        });
        embed.addFields({
          name: "Edited Message",
          value: `\`\`\`${
            oldMessage.content ? fullOldMessage.content : "Unknown."
          }\`\`\` → \`\`\`${
            newMessage.content ? fullNewMessage.content : "Unknown."
          }\`\`\``,
          inline: false,
        });
      } else if (logData) {
        await logs.findOneAndUpdate(
          { Guild: newMessage.guild.id, Message: newMessage.id },
          {
            $push: {
              Content: {
                $each: [
                  oldMessage.content
                    ? fullOldMessage.content
                    : "Edited Message Failed to Log.",
                ],
              },
            },
            Edited: newMessage.editedAt,
            Edits: logData.Edits + 1,
          }
        );
        embed.addFields({
          name: "Edited Message",
          value: `\`\`\`${
            oldMessage.content ? fullOldMessage.content : logData.Content[0]
          }\`\`\` → \`\`\`${
            newMessage.content ? fullNewMessage.content : "Unknown."
          }\`\`\``,
          inline: false,
        });
      }
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.log("Error in MessageEdit event:", error);
  }
});

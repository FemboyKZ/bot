const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/messages.js");

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage, client) {
    if (newMessage.partial && newMessage.partial === true)
      await newMessage.fetch();
    if (oldMessage.partial && oldMessage.partial === true)
      await oldMessage.fetch();

    if (!newMessage.guild) return;
    if (oldMessage.webhookId !== null || newMessage.webhookId !== null) return;
    if (oldMessage.author === client.user || newMessage.author === client.user)
      return;

    if (oldMessage.content === newMessage.content) return;

    const auditlogData = await schema.findOne({
      Guild: newMessage.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
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
        if (!logData) {
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

          await channel.send({ embeds: [embed] });
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
            },
          );
        }
        embed.addFields({
          name: "Edited Message",
          value: `\`Message Too Long or null.\``,
          inline: false,
        });
        await channel.send({ embeds: [embed] });
      } else {
        if (!logData) {
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
          await channel.send({ embeds: [embed] });
        } else if (logData) {
          await logs.findOneAndUpdate(
            { Guild: newMessage.guild.id, Message: newMessage.id },
            {
              $push: {
                Content: {
                  $each: [
                    oldMessage.content || "Edited Message Failed to Log.",
                  ],
                },
              },
              Edited: newMessage.editedAt,
              Edits: logData.Edits + 1,
            },
          );
          embed.addFields({
            name: "Edited Message",
            value: `\`\`\`${
              oldMessage.content ? logData.Content[0] : "Unknown."
            }\`\`\` → \`\`\`${newMessage.content || "Unknown."}\`\`\``,
            inline: false,
          });
          await channel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.log("Error in MessageEdit event:", error);
    }
  },
};

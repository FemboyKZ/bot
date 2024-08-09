const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const { client } = require("../index.js");

client.on(Events.MessageDelete, async (message) => {
  if (!message.guild) return;
  const data = await schema.findOne({
    Guild: message.guild.id,
    ID: "audit-logs",
  });
  if (!data) return;
  const logID = data.Channel;
  if (!logID) return;
  if (!message.author) return;
  if (message.author.bot) return;
  if (message.author.id !== client.user.id) return;

  try {
    const auditChannel = client.channels.cache.get(logID);
    const fullMessage = await message.fetch();
    if (!auditChannel) return;

    if (message.content.length >= 3072 || fullMessage.content.length >= 3072) {
      const auditEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setFooter({ text: "FKZ Log System" })
        .setTitle("Very Long Message Deleted")
        .setDescription("Message too long to display in audit log.")
        .addFields(
          {
            name: "Author:",
            value: `${message.author}`,
            inline: false,
          },
          {
            name: "Channel:",
            value: `${message.channel}`,
            inline: false,
          },
          {
            name: "MessageID:",
            value: `${message.id}`,
            inline: false,
          }
        );
      await auditChannel.send({ embeds: [auditEmbed] });
      return;
    }

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Message Deleted")
      .setDescription(`\`\`\`\n${message.content}\n\`\`\``);
    if (fullMessage.content) {
      auditEmbed.addFields(
        {
          name: "FullMsg:",
          value: `\`\`\`\n${fullMessage.content}\n\`\`\``,
          inline: false,
        },
        {
          name: "Author:",
          value: `${message.author}`,
          inline: false,
        },
        {
          name: "Channel:",
          value: `${message.channel}`,
          inline: false,
        },
        {
          name: "MessageID:",
          value: `${message.id}`,
          inline: false,
        }
      );
    } else {
      auditEmbed.addFields(
        {
          name: "Author:",
          value: `${message.author}`,
          inline: false,
        },
        {
          name: "Channel:",
          value: `${message.channel}`,
          inline: false,
        },
        {
          name: "MessageID:",
          value: `${message.id}`,
          inline: false,
        }
      );
    }
    await auditChannel.send({ embeds: [auditEmbed] });
  } catch (err) {
    console.log(err);
  }
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  if (!newMessage.guild) return;
  const data = await schema.findOne({
    Guild: newMessage.guild.id,
    ID: "audit-logs",
  });
  if (!data) return;
  const logID = data.Channel;
  if (!logID) return;
  if (!oldMessage.author) return;
  if (oldMessage.author.bot) return;

  try {
    const auditChannel = client.channels.cache.get(logID);
    if (!auditChannel) return;
    const fullOldMessage = await oldMessage.fetch();

    if (
      oldMessage.content.length >= 1536 ||
      fullOldMessage.content.length >= 1536
    ) {
      const auditEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setFooter({ text: "FKZ Log System" })
        .setTitle("Very Long Message Edited")
        .setDescription("Message too long to display in audit log.")
        .addFields(
          {
            name: "Author:",
            value: `${oldMessage.author}`,
            inline: false,
          },
          {
            name: "Channel:",
            value: `${oldMessage.channel}`,
            inline: false,
          },
          {
            name: "MessageID:",
            value: `${oldMessage.id}`,
            inline: false,
          }
        );
      await auditChannel.send({ embeds: [auditEmbed] });
      return;
    }

    const changes = [];
    if (oldMessage.content !== newMessage.content) {
      changes.push(
        `**Message:**\n \`\`\`\n${
          oldMessage.content || "None"
        }\`\`\`\n→\n\`\`\`\n${newMessage.content || "None"}\n\`\`\``
      );

      if (
        fullOldMessage.content.length >= 1536 ||
        oldMessage.content?.length >= 1536 ||
        newMessage.content.length >= 1536 ||
        changes.length === 0
      ) {
        return;
      }

      const changesText = changes.join("\n");

      const auditEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setFooter({ text: "FKZ Log System" })
        .setTitle("Message Edited")
        .setDescription(`${changesText}`)
        .addFields(
          {
            name: "Author:",
            value: `${oldMessage.author}`,
            inline: false,
          },
          {
            name: "Channel:",
            value: `${oldMessage.channel}`,
            inline: false,
          },
          {
            name: "MessageID:",
            value: `${oldMessage.id}`,
          }
        );
      await auditChannel.send({ embeds: [auditEmbed] });
    }
  } catch (err) {
    console.log(err);
  }
});

const { EmbedBuilder, Events } = require("discord.js");
const Audit_Log = require("../Schemas/auditlog.js");
const { client } = require("../index.js");

client.on(Events.MessageDelete, async (message) => {
  if (!message.guild) return;
  const data = await Audit_Log.findOne({
    Guild: message.guild.id,
  });
  if (!data) return;
  const logID = data.Channel;
  if (!logID) return;
  if (!message.author) return;
  if (message.author.bot) return;
  if (message.author.id !== client.user.id) return;

  try {
    const fullMessage = await message.fetch();
    const auditChannel = client.channels.cache.get(logID);
    if (!auditChannel) return;

    const content = fullMessage.content || message.content || "none";
    if (content.length >= 3072) return;

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Message Deleted")
      .setAuthor({ name: "Message:" })
      .setDescription(content)
      .addFields(
        {
          name: "Author:",
          value: `${fullMessage.author || message.author}`,
          inline: false,
        },
        {
          name: "Channel:",
          value: `${fullMessage.channel || message.channel}`,
          inline: false,
        },
        {
          name: "MessageID:",
          value: `${fullMessage.id || message.id}`,
          inline: false,
        }
      );
    await auditChannel.send({ embeds: [auditEmbed] });
  } catch (err) {
    console.log(err);
  }
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  if (!newMessage.guild) return;
  const data = await Audit_Log.findOne({
    Guild: newMessage.guild.id,
  });
  if (!data) return;
  const logID = data.Channel;
  if (!logID) return;
  if (!oldMessage.author) return;
  if (oldMessage.author.bot) return;

  try {
    const auditChannel = client.channels.cache.get(logID);
    if (!auditChannel) return;

    const changes = [];
    if (oldMessage.content !== newMessage.content) {
      const fullOldMessage = await oldMessage.fetch();
      const fullOldMessageText = fullOldMessage.content;
      const oldMessageText = oldMessage.content;
      const fullOldAuthor = fullOldMessage.author;
      changes.push(
        `Message: \`${fullOldMessageText || oldMessageText || "None"}\` → \`${
          newMessage.content || "None"
        }\``
      );

      if (fullOldMessageText?.length >= 1536 || oldMessageText?.length >= 1536)
        return;
      if (newMessage.content.length >= 1536) return;
      if (changes.length === 0) return;
      const changesText = changes.join("\n");

      const auditEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setFooter({ text: "FKZ Log System" })
        .setTitle("Message Edited")
        .setAuthor({ name: "Edit:" })
        .setDescription(changesText)
        .addFields(
          {
            name: "Author:",
            value: `${fullOldAuthor || oldMessage.author || "unknown"}`,
            inline: false,
          },
          {
            name: "Channel:",
            value: `${newMessage.channel}`,
            inline: false,
          },
          {
            name: "MessageID:",
            value: `${newMessage.id}`,
          }
        );
      await auditChannel.send({ embeds: [auditEmbed] });
    }
  } catch (err) {
    console.log(err);
  }
});

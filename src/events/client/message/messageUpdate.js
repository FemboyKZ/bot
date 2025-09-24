const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/baseSystem.js");
const logs = require("../../../schemas/events/messages.js");

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage, client) {
    if (newMessage.partial) await newMessage.fetch().catch(() => null);
    if (oldMessage.partial) await oldMessage.fetch().catch(() => null);

    if (!newMessage.guild) return;
    if (oldMessage.webhookId || newMessage.webhookId) return;
    if (
      oldMessage.author?.id === client.user.id ||
      newMessage.author?.id === client.user.id
    )
      return;
    if (oldMessage.content === newMessage.content) return;

    const auditlogData = await schema.findOne({
      Guild: newMessage.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData?.Channel) return;

    const channel = client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    try {
      const date = new Date();
      const logData = await logs.findOne({
        Guild: newMessage.guild.id,
        Message: newMessage.id,
      });

      const isContentValid =
        !oldMessage.content ||
        !newMessage.content ||
        oldMessage.content.length === 0 ||
        newMessage.content.length === 0 ||
        oldMessage.content.length > 512 ||
        newMessage.content.length > 512;

      const contentToLog = isContentValid
        ? "Edited Message Too long to Log."
        : oldMessage.content || "Edited Message Failed to Log.";

      const displayContent = isContentValid
        ? "`Message Too Long or null.`"
        : `\`\`\`${oldMessage.content || "Unknown."}\`\`\` → \`\`\`${newMessage.content || "Unknown."}\`\`\``;

      const updateData = {
        $push: { Content: contentToLog },
        Edited: newMessage.editedAt || date,
        Edits: (logData?.Edits || 0) + 1,
      };

      if (!logData) {
        await logs.create({
          Guild: newMessage.guild.id,
          User: newMessage.author.id,
          Channel: newMessage.channel.id,
          Message: newMessage.id,
          Content: [contentToLog],
          Images: oldMessage.attachments.map((attachment) => attachment.url),
          Created: oldMessage.createdAt,
          Edited: newMessage.editedAt || date,
          Deleted: null,
          Edits: 1,
        });
      } else {
        await logs.findOneAndUpdate(
          { Guild: newMessage.guild.id, Message: newMessage.id },
          updateData,
        );
      }

      const embed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setFooter({ text: `FKZ • ID: ${newMessage.id}` })
        .setTitle("Message Edited")
        .addFields(
          {
            name: "Author",
            value: `<@${newMessage.author.id}> - \`${newMessage.author.username}\``,
            inline: true,
          },
          {
            name: "Channel",
            value: `<#${newMessage.channel.id}>`,
            inline: true,
          },
          {
            name: "Edited Message",
            value: displayContent,
            inline: false,
          },
        );

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in MessageEdit event:", error);
    }
  },
};

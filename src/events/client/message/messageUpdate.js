const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const logs = require("../../../schemas/events/messages.js");
const {
  collectMedia,
  mediaUrls,
  previewImageUrl,
  attachmentsField,
  resolveReply,
  replyField,
  prepareMediaUpload,
} = require("../../../utils/messageLog.js");

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

    const channel = await getAuditChannel(newMessage.guild, client);
    if (!channel) return;

    try {
      const date = new Date();
      const logData = await logs.findOne({
        Guild: newMessage.guild.id,
        Message: newMessage.id,
      });

      const media = collectMedia(newMessage);
      const reply = await resolveReply(newMessage);

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

      // Download + re-host media so the log keeps a permanent copy (tags `media`
      // with rehosted/fileName, used by the field + preview below).
      const { files, previewName } = await prepareMediaUpload(
        media,
        newMessage.guild,
      );

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
        );

      const replyValue = replyField(reply);
      if (replyValue)
        embed.addFields({
          name: "Reply To",
          value: replyValue,
          inline: false,
        });

      embed.addFields({
        name: "Edited Message",
        value: displayContent,
        inline: false,
      });

      const mediaValue = attachmentsField(media);
      if (mediaValue)
        embed.addFields({
          name: "Attachments",
          value: mediaValue,
          inline: false,
        });

      if (previewName) embed.setImage(`attachment://${previewName}`);
      else {
        const preview = previewImageUrl(media);
        if (preview) embed.setImage(preview);
      }

      const sent = await channel.send({ embeds: [embed], files });
      // Persist the re-hosted urls (live as long as the audit message) when the
      // upload succeeded; otherwise fall back to the original CDN urls.
      const storedImages = sent.attachments.size
        ? [...sent.attachments.values()].map((a) => a.url)
        : mediaUrls(newMessage);

      if (!logData) {
        await logs.create({
          Guild: newMessage.guild.id,
          User: newMessage.author.id,
          Channel: newMessage.channel.id,
          Message: newMessage.id,
          Content: [contentToLog],
          Images: storedImages,
          ReplyTo: reply?.messageId ?? null,
          ReplyToUser: reply?.userId ?? null,
          Created: oldMessage.createdAt,
          Edited: newMessage.editedAt || date,
          Deleted: null,
          Edits: 1,
        });
      } else {
        await logs.findOneAndUpdate(
          { Guild: newMessage.guild.id, Message: newMessage.id },
          {
            $push: { Content: contentToLog },
            Images: storedImages,
            Edited: newMessage.editedAt || date,
            Edits: (logData.Edits || 0) + 1,
          },
        );
      }
    } catch (error) {
      console.error("Error in MessageEdit event:", error);
    }
  },
};

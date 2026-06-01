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
  name: Events.MessageDelete,
  async execute(message, client) {
    try {
      if (message.partial && message.partial === true) await message.fetch();
    } catch (error) {
      console.log(error);
    }

    if (!message.guild) return;
    // author can be null when a partial/uncached message fails to fetch.
    if (!message.author) return;
    if (message.webhookId !== null || message.author.id === client.user.id)
      return;

    const hasContent = message.content && message.content.length > 0;
    const hasMedia = message.attachments.size > 0 || message.stickers.size > 0;
    // Nothing to log (e.g. embed-only/system message).
    if (!hasContent && !hasMedia) return;

    const channel = await getAuditChannel(message.guild, client);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: message.guild.id,
      Message: message.id,
    });

    const date = new Date();
    const media = collectMedia(message);
    const reply = await resolveReply(message);

    const tooLong = hasContent && message.content.length > 512;
    const storedContent = tooLong
      ? "Deleted Message Too long to Log."
      : hasContent
        ? message.content
        : "[no text - media only]";

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ • ID: ${message.id}` })
      .setTitle("Message Deleted")
      .addFields(
        {
          name: "Author",
          value: `<@${message.author.id}> - \`${message.author.username}\``,
          inline: true,
        },
        {
          name: "Channel",
          value: `<#${message.channel.id}>`,
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
      name: "Deleted Message",
      value: tooLong
        ? "`Message Too long to Log.`"
        : hasContent
          ? `\`\`\`${message.content}\`\`\``
          : "`No text content.`",
      inline: false,
    });

    // Download + re-host media so the log keeps a permanent copy (tags `media`
    // with rehosted/fileName, used by the field + preview below).
    const { files, previewName } = await prepareMediaUpload(
      media,
      message.guild,
    );

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

    // Edited-then-deleted: show the last version we have on record.
    if (logData && logData.Edits > 0 && logData.Content[logData.Edits]) {
      embed.spliceFields(
        embed.data.fields.findIndex((f) => f.name === "Deleted Message"),
        1,
        {
          name: "Deleted Message",
          value: `\`\`\`${logData.Content[logData.Edits]}\`\`\``,
          inline: false,
        },
      );
    }

    try {
      const sent = await channel.send({ embeds: [embed], files });
      // Persist the re-hosted urls (live as long as the audit message) when the
      // upload succeeded; otherwise fall back to the original CDN urls.
      const storedImages = sent.attachments.size
        ? [...sent.attachments.values()].map((a) => a.url)
        : mediaUrls(message);

      if (!logData) {
        await logs.create({
          Guild: message.guild.id,
          User: message.author.id,
          Channel: message.channel.id,
          Message: message.id,
          Content: [storedContent],
          Images: storedImages,
          ReplyTo: reply?.messageId ?? null,
          ReplyToUser: reply?.userId ?? null,
          Created: message.createdAt,
          Deleted: date,
          Edited: null,
          Edits: 0,
        });
      } else {
        await logs.findOneAndUpdate(
          { Guild: message.guild.id, Message: message.id },
          {
            $push: { Content: { $each: [storedContent] } },
            Images: storedImages,
            Deleted: date,
          },
        );
      }
    } catch (error) {
      console.log("Error in MessageDelete event:", error);
    }
  },
};

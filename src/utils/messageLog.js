const { MessageType, AttachmentBuilder } = require("discord.js");

// Embed field value hard cap.
const FIELD_MAX = 1024;
// Discord per-message attachment cap.
const MAX_REHOST_FILES = 10;
// Fallback upload limit when guild value is unavailable (10 MiB, tier 0).
const DEFAULT_UPLOAD_LIMIT = 10 * 1024 * 1024;

/**
 * Collect every media item on a message: attachments + stickers.
 * Full CDN url is preserved (incl. the signed ?ex=&is=&hm= params that
 * Discord now requires) so the stored/linked url stays valid.
 *
 * @returns {{ name: string, url: string, contentType: string|null, size: number|null, isImage: boolean, spoiler: boolean }[]}
 */
function collectMedia(message) {
  const media = [];

  for (const a of message.attachments.values()) {
    media.push({
      name: a.name || "attachment",
      url: a.url,
      contentType: a.contentType || null,
      size: a.size ?? null,
      isImage: a.contentType?.startsWith("image/") || a.width != null,
      spoiler: a.spoiler ?? false,
    });
  }

  for (const s of message.stickers.values()) {
    media.push({
      name: `${s.name} (sticker)`,
      url: s.url,
      contentType: "image/png",
      size: null,
      isImage: true,
      spoiler: false,
    });
  }

  return media;
}

/** Plain url list for DB storage (schema `Images`). */
function mediaUrls(message) {
  return collectMedia(message).map((m) => m.url);
}

/** First displayable image url, for embed `.setImage()` preview. */
function previewImageUrl(media) {
  return media.find((m) => m.isImage && !m.spoiler)?.url || null;
}

/**
 * Build the "Attachments" embed field value. Markdown links keep the visible
 * text short while the (long, signed) url stays clickable. Capped to 1024.
 *
 * @returns {string|null} null when no media
 */
function attachmentsField(media) {
  if (!media.length) return null;

  const lines = [];
  let used = 0;
  let shown = 0;

  for (const m of media) {
    const icon = m.isImage ? "IMG" : "FILE";
    const spoiler = m.spoiler ? " ‖spoiler‖" : "";
    const saved = m.rehosted ? " · saved" : "";
    const line = `${icon} [${m.name}](${m.url})${spoiler}${saved}`;
    // +1 for the joining newline.
    if (used + line.length + 1 > FIELD_MAX) break;
    lines.push(line);
    used += line.length + 1;
    shown++;
  }

  const remaining = media.length - shown;
  if (remaining > 0) lines.push(`+${remaining} more`);

  return lines.join("\n");
}

/**
 * Resolve reply info. Only true replies (MessageType.Reply) - pins/crossposts
 * also set `reference` but are not replies.
 *
 * @returns {Promise<{ messageId: string, userId: string|null, username: string|null, jump: string }|null>}
 */
async function resolveReply(message) {
  if (message.type !== MessageType.Reply || !message.reference?.messageId)
    return null;

  const ref = await message.fetchReference().catch(() => null);
  const guildId = message.reference.guildId || message.guild?.id;
  const channelId = message.reference.channelId;
  const jump = `https://discord.com/channels/${guildId}/${channelId}/${message.reference.messageId}`;

  return {
    messageId: message.reference.messageId,
    userId: ref?.author?.id ?? null,
    username: ref?.author?.username ?? null,
    jump,
  };
}

/** "Reply To" embed field value, or null. */
function replyField(reply) {
  if (!reply) return null;
  const who = reply.userId
    ? `<@${reply.userId}> - \`${reply.username}\``
    : "`unknown / deleted user`";
  return `${who}\n[jump to replied message](${reply.jump})`;
}

/** Filesystem/attachment-safe name, deduped by index. */
function safeFileName(name, i) {
  const cleaned = (name || "file")
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+/, "")
    .slice(-80);
  return `${i}_${cleaned || "file"}`;
}

/**
 * Download each media item and wrap it as a re-uploadable attachment, so the
 * audit message keeps a permanent copy after Discord's signed CDN url expires
 * (~24h). Failures (dead url, oversize, >10 files) are skipped, not fatal — the
 * log still posts with whatever re-hosted successfully.
 *
 * The original `media` items are tagged in place: `rehosted` (bool) and
 * `fileName` (the attachment name) so callers can mark them in the field list
 * and point the embed preview at `attachment://<fileName>`.
 *
 * @returns {Promise<{ files: AttachmentBuilder[], previewName: string|null }>}
 */
async function prepareMediaUpload(media, guild) {
  const limit = guild?.maximumUploadLimit ?? DEFAULT_UPLOAD_LIMIT;
  const files = [];
  let previewName = null;

  for (let i = 0; i < media.length; i++) {
    const m = media[i];
    if (files.length >= MAX_REHOST_FILES) break;
    if (m.size != null && m.size > limit) continue; // known-oversize, skip early

    try {
      const res = await fetch(m.url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > limit) continue; // oversize after download

      const name = safeFileName(m.name, i);
      const file = new AttachmentBuilder(buf, { name });
      if (m.spoiler) file.setSpoiler(true);
      files.push(file);

      m.rehosted = true;
      m.fileName = name;
      if (!previewName && m.isImage && !m.spoiler) previewName = name;
    } catch {
      // network error / aborted — leave this item url-only
    }
  }

  return { files, previewName };
}

module.exports = {
  collectMedia,
  mediaUrls,
  previewImageUrl,
  attachmentsField,
  resolveReply,
  replyField,
  prepareMediaUpload,
};

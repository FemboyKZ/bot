/**
 * Canonical reaction key for an emoji: `<a?:name:id>` for custom emojis
 * (the `a` prefix kept for animated), or the raw unicode char otherwise.
 * Matches how reaction-role configs store the emoji so lookups line up.
 *
 * @param {import("discord.js").Emoji | import("discord.js").ReactionEmoji} emoji
 * @returns {string|null}
 */
function emojiKey(emoji) {
  if (!emoji) return null;
  return emoji.id
    ? `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`
    : emoji.name;
}

module.exports = { emojiKey };

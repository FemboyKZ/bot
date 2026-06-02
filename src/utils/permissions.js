const { PermissionFlagsBits, MessageFlags } = require("discord.js");

/**
 * Gate a command on the Administrator permission. Returns true if allowed;
 * otherwise replies with an ephemeral denial and returns false.
 *
 * Usage: `if (!(await requireAdmin(interaction))) return;`
 *
 * @param {import("discord.js").Interaction} interaction
 * @returns {Promise<boolean>}
 */
async function requireAdmin(interaction) {
  if (interaction.member?.permissions?.has(PermissionFlagsBits.Administrator)) {
    return true;
  }
  await interaction
    .reply({
      content: "You don't have perms to use this command.",
      flags: MessageFlags.Ephemeral,
    })
    .catch(() => {});
  return false;
}

module.exports = { requireAdmin };

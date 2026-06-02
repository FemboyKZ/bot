const { EmbedBuilder } = require("discord.js");

// FKZ brand pink, used by every embed in the bot.
const FKZ_COLOR = "#ff00b3";

/**
 * EmbedBuilder preset with the FKZ color and a timestamp already applied.
 * Chain the rest (.setTitle/.addFields/.setFooter/...) as normal.
 *
 * @returns {EmbedBuilder}
 */
function fkzEmbed() {
  return new EmbedBuilder().setColor(FKZ_COLOR).setTimestamp();
}

module.exports = { fkzEmbed, FKZ_COLOR };

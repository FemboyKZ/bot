const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const logs = require("../../../schemas/events/guilds.js");

const VERIFICATION = ["None", "Low", "Medium", "High", "Very High"];

module.exports = {
  name: Events.GuildUpdate,
  async execute(oldGuild, newGuild, client) {
    try {
      const changes = [];
      const push = (name, before, after) => {
        if (before !== after) {
          changes.push({
            name,
            value: `\`${(before ?? "none").toString().slice(0, 480)}\` → \`${(after ?? "none").toString().slice(0, 480)}\``,
            inline: false,
          });
        }
      };

      push("Name", oldGuild.name, newGuild.name);
      push("Owner", `<@${oldGuild.ownerId}>`, `<@${newGuild.ownerId}>`);
      push("Vanity URL", oldGuild.vanityURLCode, newGuild.vanityURLCode);
      push(
        "Verification Level",
        VERIFICATION[oldGuild.verificationLevel] ?? oldGuild.verificationLevel,
        VERIFICATION[newGuild.verificationLevel] ?? newGuild.verificationLevel,
      );
      push("Icon", oldGuild.iconURL(), newGuild.iconURL());
      push("Banner", oldGuild.bannerURL(), newGuild.bannerURL());
      push("Description", oldGuild.description, newGuild.description);
      push(
        "AFK Channel",
        oldGuild.afkChannelId ? `<#${oldGuild.afkChannelId}>` : "none",
        newGuild.afkChannelId ? `<#${newGuild.afkChannelId}>` : "none",
      );

      // Keep the stored guild record in sync with the user-facing fields.
      await logs
        .updateOne(
          { Guild: newGuild.id },
          {
            Name: newGuild.name,
            User: newGuild.ownerId,
            Icon: newGuild.iconURL() || null,
            Banner: newGuild.bannerURL() || null,
            Vanity: newGuild.vanityURLCode || null,
          },
          { upsert: true },
        )
        .catch((e) => console.error("GuildUpdate DB sync failed:", e));

      if (!changes.length) return;

      const channel = await getAuditChannel(newGuild, client);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setTitle("Server Updated")
        .setFooter({ text: `FKZ • ID: ${newGuild.id}` })
        .addFields(changes);

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in GuildUpdate event:", error);
    }
  },
};

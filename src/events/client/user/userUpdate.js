const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const logs = require("../../../schemas/events/members.js");
const { fkzEmbed } = require("../../../utils/embeds.js");

const UNKNOWN_AVATAR =
  "https://files.femboykz.com/web/images/avatars/unknown.png?raw=1";

module.exports = {
  name: Events.UserUpdate,
  async execute(oldUser, newUser, client) {
    try {
      // User-level changes are global; they don't carry guild context, so
      // mirror them into every guild the user shares with the bot.
      const nameChanged = oldUser.username !== newUser.username;
      const avatarChanged = oldUser.avatar !== newUser.avatar;
      const bannerChanged = oldUser.banner !== newUser.banner;
      const globalNameChanged = oldUser.globalName !== newUser.globalName;

      if (
        !nameChanged &&
        !avatarChanged &&
        !bannerChanged &&
        !globalNameChanged
      ) {
        return;
      }

      const oldAvatar = oldUser.displayAvatarURL({ size: 128 });
      const newAvatar = newUser.displayAvatarURL({ size: 128 });
      const newBanner = newUser.bannerURL({ size: 128 }) || null;

      for (const [, guild] of client.guilds.cache) {
        const member = guild.members.cache.get(newUser.id);
        if (!member) continue;

        const update = {};
        if (nameChanged) update.Name = newUser.username;
        if (avatarChanged) update.Avatar = newAvatar || UNKNOWN_AVATAR;
        if (bannerChanged) update.Banner = newBanner || "";
        // displayName follows the global name when the member has no nickname.
        if (globalNameChanged || nameChanged) {
          update.Displayname = member.displayName;
        }

        if (Object.keys(update).length > 0) {
          // No upsert, required fields are seeded by guildMemberAdd/Update.
          await logs.updateOne({ Guild: guild.id, User: newUser.id }, update);
        }

        const channel = await getAuditChannel(guild, client);
        if (!channel) continue;

        const embed = fkzEmbed()
          .setAuthor({ name: `${newUser.tag} (${newUser.id})` })
          .setTitle("User Profile Updated")
          .setTimestamp();

        if (nameChanged) {
          embed.addFields({
            name: "Username",
            value: `**Before:** ${oldUser.username}\n**After:** ${newUser.username}`,
            inline: false,
          });
        }
        if (globalNameChanged) {
          embed.addFields({
            name: "Display Name",
            value: `**Before:** ${oldUser.globalName || "None"}\n**After:** ${
              newUser.globalName || "None"
            }`,
            inline: false,
          });
        }
        if (avatarChanged) {
          embed
            .addFields({
              name: "Avatar",
              value: `[Old](<${oldAvatar}>)\n[New](<${newAvatar}>)`,
              inline: true,
            })
            .setThumbnail(newAvatar);
        }
        if (bannerChanged) {
          embed.addFields({
            name: "Banner",
            value: `**Before:** ${oldUser.bannerURL({ size: 128 }) || "None"}\n**After:** ${
              newBanner || "None"
            }`,
            inline: true,
          });
        }

        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error(
        "Error handling UserUpdate for user",
        newUser?.id,
        error.stack,
      );
    }
  },
};

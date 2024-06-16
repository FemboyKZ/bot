const { EmbedBuilder, Events } = require("discord.js");
const Audit_Log = require("./Schemas/auditlog");
const { client } = require("./index.js");
require("dotenv").config();

client.on(Events.UserUpdate, async (oldUser, newUser) => {
  try {
    const logGuild = await client.guilds.fetch(process.env.GUILD_ID);
    const data = await Audit_Log.findOne({ Guild: logGuild }); // can't fetch guild this way?
    const logID = data ? data.Channel : null;
    if (
      !logID ||
      oldUser.bot ||
      newUser.bot ||
      oldUser.system ||
      newUser.system
    )
      return;
    if (oldUser.partial) await oldUser.fetch().catch(() => {});

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" })
      .setTitle("User Updated")
      .addFields({
        name: "User:",
        value: `<@${newUser.id}> - ${newUser.username}`,
        inline: false,
      });

    const logschatID = await client.channels.fetch(process.env.LOGS_CHAT_ID);

    const auditChannel = client.channels.cache.get(logID);
    const auditChannel2 = client.channels.cache.get(logschatID);
    if (!auditChannel || !auditChannel2) return;

    if (oldUser.username !== newUser.username) {
      const fullOldUser = await oldUser.fetch().catch(() => {});
      const fullOldUsername = fullOldUser?.username;
      auditEmbed.addFields({
        name: `Username Updated`,
        value: `Name: \`${
          fullOldUsername || oldUser.username || "none"
        }\`  →  \`${newUser.username || "none"}\``,
        inline: false,
      });
      if (!newUser.username || !fullOldUsername) return;
      await auditChannel2.send({ embeds: [auditEmbed] });
    }

    if (oldUser.avatar !== newUser.avatar) {
      const fullOldUser = await oldUser.fetch().catch(() => {});
      const fullOldPfp = fullOldUser?.avatarURL({ size: 512 });
      const oldPfp = oldUser.avatarURL({ size: 512 });
      const UserPfp = newUser.avatarURL({ size: 64 });
      auditEmbed.setImage(`${UserPfp}`).addFields({
        name: `Profile picture updated`,
        value: `[Old Pfp](<${
          fullOldPfp || oldPfp
        }>)  →  [New Pfp](<${newUser.avatarURL({ size: 512 })}>)`,
        inline: false,
      });
      if (!newUser.avatar || !fullOldPfp || !oldPfp) return;
      await auditChannel2.send({ embeds: [auditEmbed] });
    }

    if (oldUser.banner !== newUser.banner) {
      const fullOldUser = await oldUser.fetch().catch(() => {});
      const fullOldBanner = fullOldUser?.bannerURL({ size: 512 });
      const oldBanner = oldUser.bannerURL({ size: 512 });
      const Banner = newUser.bannerURL({ size: 64 });
      auditEmbed.setImage(`${Banner}`).addFields({
        name: `Banner updated`,
        value: `[Old Banner](<${
          fullOldBanner || oldBanner
        }>)  →  [New Banner](<${newUser.bannerURL({ size: 512 })}>)`,
        inline: false,
      });
      if (!newUser.banner || !fullOldBanner || !oldBanner) return;
      await auditChannel2.send({ embeds: [auditEmbed] });
    }
  } catch (error) {
    console.error(error);
  }
});

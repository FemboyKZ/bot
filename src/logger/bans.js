const { EmbedBuilder, Events } = require("discord.js");
const Audit_Log = require("../Schemas/auditlog.js");
const { client } = require("../index.js");

client.on(Events.GuildBanAdd, async (guild, user) => {
  const data = await Audit_Log.findOne({
    Guild: guild.id,
  });
  if (!data) return;

  const logID = data.Channel;
  if (!logID) return;

  const bans = await user.guild.bans.fetch();
  const banInfo = bans.get(user.id);
  if (!banInfo) return;

  const { reason, executor } = banInfo;
  let reasons = JSON.stringify(reason);

  const auditChannel = client.channels.cache.get(logID);
  if (!auditChannel) return;

  const fullUser = await user.fetch();
  let banUser;

  if (user === undefined || user === null) {
    banUser = fullUser.id;
  } else {
    banUser = user.id;
  }
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Ban Added")
    .addFields(
      {
        name: "Banned Member:",
        value: `<@${banUser}>` || "unknown",
        inline: false,
      },
      {
        name: "Executor:",
        value: `<@${executor.id}>` || "unknown",
        inline: false,
      },
      {
        name: "Reason:",
        value: `${reasons}` || "none",
        inline: false,
      }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});

client.on(Events.GuildBanRemove, async (user) => {
  const data = await Audit_Log.findOne({
    Guild: user.guild.id,
  });
  if (!data) return;

  const logID = data.Channel;
  if (!logID) return;

  const bans = await user.guild.bans.fetch();
  const banInfo = bans.get(user.id);
  if (!banInfo) return;

  const { executor } = banInfo;

  const auditChannel = client.channels.cache.get(logID);
  if (!auditChannel) return;

  const fullUser = await user.fetch();
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Ban Removed")
    .addFields(
      {
        name: "Member:",
        value: fullUser.user ? fullUser.user.tag : user.tag || "unknown",
        inline: false,
      },
      {
        name: "Admin:",
        value: `<@${executor.id}>` || "unknown",
        inline: false,
      }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});

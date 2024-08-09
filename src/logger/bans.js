const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const { client } = require("../index.js");

client.on(Events.GuildBanAdd, async (guild, user) => {
  const data = await schema.findOne({
    Guild: guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const bans = await user.guild.bans.fetch();
  const banInfo = bans.get(user.id);
  if (!banInfo) return;

  const { reason, executor } = banInfo;
  let reasons = JSON.stringify(reason);

  const fullUser = await user.fetch();
  let banUser;

  if (user === undefined || user === null) {
    banUser = fullUser.id;
  } else {
    banUser = user.id;
  }
  const embed = new EmbedBuilder()
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
  await channel.send({ embeds: [embed] });
});

client.on(Events.GuildBanRemove, async (user) => {
  const data = await schema.findOne({
    Guild: user.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const bans = await user.guild.bans.fetch();
  const banInfo = bans.get(user.id);
  if (!banInfo) return;

  const { executor } = banInfo;

  const fullUser = await user.fetch();
  const embed = new EmbedBuilder()
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
  await channel.send({ embeds: [embed] });
});

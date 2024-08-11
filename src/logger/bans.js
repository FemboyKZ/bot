const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/bans.js");
const member = require("../Schemas/logger/members.js");
const settings = require("../Schemas/logger/settings.js");
const { client } = require("../index.js");

client.on(Events.GuildBanAdd, async (ban) => {
  const settingsData = await settings.findOne({
    Guild: ban.guild.id,
  });
  if (settingsData.Bans === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: ban.guild.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
  if (!channel) return;

  const logData = await logs.findOne({
    Guild: ban.guild.id,
    User: ban.user.id,
  });

  const memberData = await member.findOne({
    Guild: ban.guild.id,
    User: ban.user.id,
  });

  const date = new Date();

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ` })
    .setTitle("Ban Added")
    .addFields(
      {
        name: "Banned Member",
        value: `<@${ban.user.id}>` || "unknown",
        inline: false,
      },
      {
        name: "Ban Reason",
        value: `${ban.reason}` || "none",
        inline: false,
      }
    );
  try {
    if (!logData && settingsData.Store === true) {
      await logs.create({
        Guild: ban.guild.id,
        User: ban.user.id,
        Reason: ban.reason,
        Created: date,
      });
    }
    if (memberData && settingsData.Store === true) {
      await member.deleteMany({ Guild: ban.guild.id, User: ban.user.id });
    }

    if (settingsData.Post === true) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Error in GuildBanAdd event:", error);
  }
});

client.on(Events.GuildBanRemove, async (ban) => {
  const settingsData = await settings.findOne({
    Guild: ban.guild.id,
  });
  if (settingsData.Bans === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: ban.guild.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
  if (!channel) return;

  const logData = await logs.findOne({
    Guild: ban.guild.id,
    User: ban.user.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ" })
    .setTitle("Ban Removed")
    .addFields(
      {
        name: "Banned Member",
        value: `<@${ban.user.id}>` || "unknown",
        inline: false,
      },
      {
        name: "Ban Reason",
        value: `${ban.reason}` || "none",
        inline: false,
      },
      {
        name: "Ban Created",
        value: logData.Created || "unknown",
        inline: false,
      }
    );

  try {
    if (logData && settingsData.Store === true) {
      await logs.deleteMany({ Guild: ban.guild.id, User: ban.user.id });
    }
    if (settingsData.Post === true) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Error in GuildBanRemove event:", error);
  }
});

const { EmbedBuilder, Events } = require("discord.js");
const Audit_Log = require("./Schemas/auditlog");
const { client } = require("./index.js");

client.on(Events.ChannelCreate, async (channel) => {
  const data = await Audit_Log.findOne({ Guild: channel.guild?.id });
  if (!data) return;
  const logID = data.Channel;
  const auditChannel = client.channels.cache.get(logID);
  if (!auditChannel) return;

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Channel Created")
    .addFields(
      {
        name: "Name:",
        value: `${channel.name || "?"}`,
        inline: false,
      },
      {
        name: "Type:",
        value: `${channel.type}`,
        inline: false,
      },
      {
        name: "Category:",
        value: `${channel.parent || "No Category"}`,
        inline: false,
      },
      {
        name: "ID:",
        value: `${channel.id}`,
        inline: false,
      }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});

client.on(Events.ChannelDelete, async (channel) => {
  const data = await Audit_Log.findOne({ Guild: channel.guild?.id });
  if (!data) return;
  const logID = data.Channel;
  const auditChannel = client.channels.cache.get(logID);
  if (!auditChannel) return;

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Channel Deleted")
    .addFields(
      {
        name: "Name:",
        value: `${channel.name || "?"}`,
        inline: false,
      },
      {
        name: "Type:",
        value: `${channel.type}`,
        inline: false,
      },
      {
        name: "Category:",
        value: `${channel.parent || "No Category"}`,
        inline: false,
      },
      {
        name: "ID:",
        value: `${channel.id}`,
        inline: false,
      }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});

client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
  const data = await Audit_Log.findOne({ Guild: oldChannel.guild?.id });
  if (!data) return;
  const logID = data.Channel;
  const auditChannel = client.channels.cache.get(logID);
  if (!auditChannel) return;

  const changes = [];

  if (oldChannel.name !== newChannel.name) {
    changes.push(
      `Name: \`${oldChannel.name || "none"}\` → \`${
        newChannel.name || "none"
      }\``
    );
  }
  if (oldChannel.parent !== newChannel.parent) {
    changes.push(
      `Category: \`${oldChannel.parent || "none"}\` → \`${
        newChannel.parent || "none"
      }\``
    );
  }
  if (oldChannel.topic !== newChannel.topic) {
    changes.push(
      `Topic: \`${oldChannel.topic || "None"}\` → \`${
        newChannel.topic || "None"
      }\``
    );
  }

  if (changes.length === 0) return;
  const changesText = changes.join("\n");

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Channel Updated")
    .addFields(
      { name: "Changes:", value: `${changesText}`, inline: false },
      { name: "ID:", value: `${newChannel.id}`, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});

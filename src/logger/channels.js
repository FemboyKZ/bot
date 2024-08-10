const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/channels.js");
const { client } = require("../index.js");

client.on(Events.ChannelCreate, async (channel) => {
  const data = await schema.findOne({
    Guild: channel.guild.id,
    ID: "audit-logs",
  });
  const auditChannel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !auditChannel) return;

  const logData = await logs.findOne({
    Guild: channel.guild.id,
    Channel: channel.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ • ID: ${channel.id}` })
    .setTitle("Channel Created")
    .addFields(
      {
        name: "Name",
        value: `${channel.name}`,
        inline: false,
      },
      {
        name: "Type",
        value: `${channel.type}`,
        inline: false,
      },
      {
        name: "Category",
        value: `${channel.parent ? logData.Parent : "Unknown"}`,
        inline: false,
      },
      {
        name: "Channel",
        value: `<#${channel.id}>`,
        inline: false,
      }
    );
  try {
    if (logData) {
      await logs.findOneAndUpdate(
        { Guild: channel.guild.id, Channel: channel.id },
        {
          Name: channel.name,
          Type: channel.type,
          Parent: channel.parent,
        }
      );
    } else {
      await logs.create({
        Guild: channel.guild.id,
        Name: channel.name,
        Type: channel.type,
        Parent: channel.parent,
        Channel: channel.id,
      });
    }
    await auditChannel.send({ embeds: [embed] });
  } catch (error) {
    console.log(error);
  }
});

client.on(Events.ChannelDelete, async (channel) => {
  const data = await schema.findOne({
    Guild: channel.guild.id,
    ID: "audit-logs",
  });
  const auditChannel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !auditChannel) return;

  const logData = await logs.findOne({
    Guild: channel.guild.id,
    Channel: channel.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ • ID: ${channel.id}` })
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
        value: `<#${channel.id}>`,
        inline: false,
      }
    );

  try {
    if (logData) {
      await logs.deleteMany({ Guild: channel.guild.id, Channel: channel.id });
    }

    await auditChannel.send({ embeds: [embed] });
  } catch (error) {
    console.log(error);
  }
});

client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
  const data = await schema.findOne({
    Guild: oldChannel.guild.id,
    ID: "audit-logs",
  });
  const auditChannel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !auditChannel) return;

  const logData = await logs.findOne({
    Guild: channel.guild.id,
    Channel: channel.id,
  });

  const changes = [];

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ • ID: ${newChannel.id}` });

  try {
    if (oldChannel.name !== newChannel.name) {
      changes.push(
        `Name: \`${oldChannel.name ? logData.Name : "none"}\` → \`${
          newChannel.name || "none"
        }\``
      );
      if (logData) {
        await logs.findOneAndUpdate(
          { Guild: newChannel.guild.id, Channel: newChannel.id },
          {
            Name: newChannel.name,
          }
        );
      }
    }
    if (oldChannel.parent !== newChannel.parent) {
      changes.push(
        `Category: \`${oldChannel.parent ? logData.Parent : "none"}\` → \`${
          newChannel.parent || "none"
        }\``
      );
      if (logData) {
        await logs.findOneAndUpdate(
          { Guild: newChannel.guild.id, Channel: newChannel.id },
          {
            Parent: newChannel.parent,
          }
        );
      }
    }
    if (oldChannel.topic !== newChannel.topic) {
      changes.push(
        `Topic: \`${oldChannel.topic ? logData.Topic : "None"}\` → \`${
          newChannel.topic || "None"
        }\``
      );
      if (logData) {
        await logs.findOneAndUpdate(
          { Guild: newChannel.guild.id, Channel: newChannel.id },
          {
            Topic: newChannel.topic || null,
          }
        );
      }
    }
    if (oldChannel.type !== newChannel.type) {
      changes.push(
        `Topic: \`${oldChannel.type ? logData.Type : "None"}\` → \`${
          newChannel.type || "None"
        }\``
      );
      if (logData) {
        await logs.findOneAndUpdate(
          { Guild: newChannel.guild.id, Channel: newChannel.id },
          {
            Type: newChannel.type || null,
          }
        );
      }
    }

    if (changes.length === 0) return;
    const changesText = changes.join("\n");

    embed.addFields({
      name: "Changes:",
      value: `${changesText}`,
      inline: false,
    });
    await auditChannel.send({ embeds: [embed] });
  } catch (error) {
    console.log(error);
  }
});

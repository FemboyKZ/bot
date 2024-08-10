const { EmbedBuilder, Events, DMChannel } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/channels.js");
const { client } = require("../index.js");

client.on(Events.ChannelCreate, async (channel) => {
  if (channel === DMChannel) return;
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
        name: "Topic",
        value: `${channel.topic ? logData.Topic : "None"}`,
        inline: false,
      },
      {
        name: "Category",
        value: `${channel.parent ? logData.Parent : "Unknown"}`,
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
    console.log("Error in ChannelCreate event:", error);
  }
});

client.on(Events.ChannelDelete, async (channel) => {
  if (channel === DMChannel) return;
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
        name: "Name",
        value: `${channel.name ? logData.Name : "Unknown"}`,
        inline: false,
      },
      {
        name: "Type",
        value: `${channel.type}`,
        inline: false,
      },
      {
        name: "Topic",
        value: `${channel.topic ? logData.Topic : "No Topic"}`,
        inline: false,
      },
      {
        name: "Category",
        value: `${channel.parent ? logData.Parent : "No Category"}`,
        inline: false,
      }
    );

  try {
    if (logData) {
      await logs.deleteMany({ Guild: channel.guild.id, Channel: channel.id });
    }

    await auditChannel.send({ embeds: [embed] });
  } catch (error) {
    console.log("Error in ChannelDelete event:", error);
  }
});

client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
  if (oldChannel === DMChannel || newChannel === DMChannel) return;
  const data = await schema.findOne({
    Guild: oldChannel.guild.id,
    ID: "audit-logs",
  });
  const auditChannel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !auditChannel) return;

  const logData = await logs.findOne({
    Guild: oldChannel.guild.id,
    Channel: oldChannel.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ • ID: ${newChannel.id}` });

  try {
    if (oldChannel.name !== newChannel.name) {
      embed.addFields({
        name: "Name",
        value: `\`${oldChannel.name ? logData.Name : "none"}\` → \`${
          newChannel.name || "none"
        }\``,
        inline: false,
      });
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
      embed.addFields({
        name: "Category",
        value: `\`${oldChannel.parent ? logData.Parent : "none"}\` → \`${
          newChannel.parent || "none"
        }\``,
        inline: false,
      });
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
      embed.addFields({
        name: "Topic",
        value: `\`${oldChannel.topic ? logData.Topic : "none"}\` → \`${
          newChannel.topic || "none"
        }\``,
        inline: false,
      });
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
      embed.addFields({
        name: "Type",
        value: `\`${oldChannel.type ? logData.Type : "none"}\` → \`${
          newChannel.type || "none"
        }\``,
        inline: false,
      });
      if (logData) {
        await logs.findOneAndUpdate(
          { Guild: newChannel.guild.id, Channel: newChannel.id },
          {
            Type: newChannel.type || null,
          }
        );
      }
    }

    if (embed.data().fields.length === 0)
      console.log("Channel Edited, No Fields");

    await auditChannel.send({ embeds: [embed] });
  } catch (error) {
    console.log("Error in ChannelUpdate event:", error);
  }
});

const { EmbedBuilder, Events } = require("discord.js");
const schema = require("./Schemas/base-system.js");
const { client } = require("./index.js");

client.on(Events.GuildCreate, async (guild) => {
  const data = await schema.findOne({
    Guild: guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const owner = await client.users.cache.get(guild.ownerId);

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("FKZ Bot has joined a new server.")
    .addFields([
      {
        name: "Server",
        value: `> ${guild.name}`,
      },
      {
        name: "Server Membercount",
        value: `> ${guild.memberCount}`,
      },
      {
        name: "Server Owner",
        value: `> ${owner.username} / ${guild.ownerId}`,
      },
      {
        name: "Server Age",
        value: `> <t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
      },
    ])
    .setTimestamp()
    .setFooter({ text: `Guild Joined - ${guild.id}` });
  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error in GuildCreate event:", error);
  }
});

client.on(Events.GuildDelete, async (guild) => {
  const data = await schema.findOne({
    Guild: guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const owner = await client.users.cache.get(guild.ownerId);

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("FKZ Bot has left a server.")
    .addFields([
      {
        name: "Server",
        value: `> ${guild.name}`,
      },
      {
        name: "Server Membercount",
        value: `> ${guild.memberCount}`,
      },
      {
        name: "Server Owner",
        value: `> ${owner.username} / ${guild.ownerId}`,
      },
      {
        name: "Server Age",
        value: `> <t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
      },
    ])
    .setTimestamp()
    .setFooter({ text: `Guild Left - ${guild.id}` });
  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error in GuildDelete event:", error);
  }
});

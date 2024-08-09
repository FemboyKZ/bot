const { EmbedBuilder, Events } = require("discord.js");
const schema = require("./Schemas/base-system.js");
const { client } = require("./index.js");

client.on(Events.GuildCreate, async (guild) => {
  const data = await schema.findOne({
    Guild: guild.id,
    ID: "audit-logs",
  });
  if (!data) return;
  const logID = data.Channel;
  const auditChannel = client.channels.cache.get(logID);
  if (!auditChannel) return;

  const name = guild.name;
  const serverID = guild.id;
  const memberCount = guild.memberCount;

  const ownerID = guild.ownerId;
  const owner = await client.users.cache.get(ownerID);
  const ownerName = owner.username;

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("FKZ Bot has joined a new server.")
    .addFields([
      {
        name: "Server",
        value: `> ${name} / ${serverID}`,
      },
      {
        name: "Server Membercount",
        value: `> ${memberCount}`,
      },
      {
        name: "Server Owner",
        value: `> ${ownerName} / ${ownerID}`,
      },
      {
        name: "Server Age",
        value: `> <t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
      },
    ])
    .setTimestamp()
    .setFooter({ text: "Guild Join" });
  await auditChannel.send({ embeds: [embed] });
});

client.on(Events.GuildDelete, async (guild) => {
  const data = await schema.findOne({
    Guild: guild.id,
    ID: "audit-logs",
  });
  if (!data) return;
  const logID = data.Channel;
  const auditChannel = client.channels.cache.get(logID);
  if (!auditChannel) return;

  const name = guild.name;
  const serverID = guild.id;
  const memberCount = guild.memberCount;

  const ownerID = guild.ownerId;
  const owner = await client.users.cache.get(ownerID);
  const ownerName = owner.username;

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("FKZ Bot has left a server.")
    .addFields([
      {
        name: "Server",
        value: `> ${name} / ${serverID}`,
      },
      {
        name: "Server Membercount",
        value: `> ${memberCount}`,
      },
      {
        name: "Server Owner",
        value: `> ${ownerName} / ${ownerID}`,
      },
      {
        name: "Server Age",
        value: `> <t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
      },
    ])
    .setTimestamp()
    .setFooter({ text: "Guild Leave" });
  await channel.send({ embeds: [embed] });
});

const { EmbedBuilder, Events } = require("discord.js");
require("dotenv").config();
const { client } = require("./index.js");

// bot join/leave logger, useless feature
// doesn't have an enable/disable command and only runs on fkz server cuz lazy lol
client.on(Events.GuildCreate, async (guild) => {
  const channel = await client.channels.cache.get(
    `${process.env.LOGS_CHAT_ID}`
  );
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
  await channel.send({ embeds: [embed] });
});

client.on(Events.GuildDelete, async (guild) => {
  const channel = await client.channels.cache.get(
    `${process.env.LOGS_CHAT_ID}`
  );
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

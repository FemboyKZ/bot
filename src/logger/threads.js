const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/threads.js");
const { client } = require("../index.js");

client.on(Events.ThreadCreate, async (thread) => {
  const data = await schema.findOne({
    Guild: thread.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Thread Created")
    .addFields(
      {
        name: "Name:",
        value: `${thread.name}`,
        inline: false,
      },
      {
        name: "Creator:",
        value: `${thread.ownerId || "unknown"}`,
        inline: false,
      },
      {
        name: "Channel:",
        value: `${thread.parent || "none"}`,
        inline: false,
      },
      {
        name: "Link:",
        value: `<#${thread.id}>`,
        inline: false,
      },
      {
        name: "ID:",
        value: `${thread.id}`,
        inline: false,
      }
    );
  await channel.send({ embeds: [embed] });
});

client.on(Events.ThreadDelete, async (thread) => {
  const data = await schema.findOne({
    Guild: thread.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Thread Deleted")
    .addFields(
      {
        name: "Name:",
        value: `${thread.name}`,
        inline: false,
      },
      {
        name: "Creator:",
        value: `${thread.ownerId || "unknown"}`,
        inline: false,
      },
      {
        name: "Channel:",
        value: `${thread.parent || "none"}`,
        inline: false,
      },
      {
        name: "Link:",
        value: `<#${thread.id}>`,
        inline: false,
      },
      {
        name: "ID:",
        value: `${thread.id}`,
        inline: false,
      }
    );
  await channel.send({ embeds: [embed] });
});

client.on(Events.ThreadUpdate, async (oldThread, newThread) => {
  const data = await schema.findOne({
    Guild: oldThread.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const changes = [];

  if (oldThread.name !== newThread.name) {
    changes.push(`Name: \`${oldThread.name}\` → \`${newThread.name}\``);
  }

  if (oldThread.archived !== newThread.archived) {
    changes.push(
      `Archived?: \`${oldThread.archived || "None"}\` → \`${
        newThread.archived || "None"
      }\``
    );
  }
  if (oldThread.locked !== newThread.locked) {
    changes.push(
      `Locked?: \`${oldThread.locked || "None"}\` → \`${
        newThread.locked || "None"
      }\``
    );
  }

  if (changes.length === 0) return;
  const changesText = changes.join("\n");

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .addFields(
      {
        name: "Creator:",
        value: `${newThread.ownerId || "unknown"}`,
        inline: false,
      },
      {
        name: "Channel:",
        value: `${newThread.parent || "unknown"}`,
        inline: false,
      },
      {
        name: "Link:",
        value: `<#${newThread.id}>`,
        inline: false,
      },
      {
        name: "Changes:",
        value: `${changesText}`,
        inline: false,
      },
      {
        name: "ID:",
        value: `${newThread.id}`,
        inline: false,
      }
    )
    .setTitle("Thread Edited")
    .setFooter({ text: "FKZ Log System" });
  await channel.send({ embeds: [embed] });
});

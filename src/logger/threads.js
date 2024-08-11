const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/threads.js");
const settings = require("../Schemas/logger/settings.js");
const { client } = require("../index.js");

client.on(Events.ThreadCreate, async (thread) => {
  const settingsData = await settings.findOne({
    Guild: thread.guild.id,
  });
  if (settingsData.Threads === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: thread.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    Guild: thread.guild.id,
    Thread: thread.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ • ID: ${thread.id}` })
    .setTitle("Thread Created")
    .addFields(
      {
        name: "Name",
        value: `${thread.name}`,
        inline: false,
      },
      {
        name: "Creator",
        value: `${thread.ownerId ? logData.User : "unknown"}`,
        inline: false,
      },
      {
        name: "Channel",
        value: `${thread.parent ? logData.Parent : "none"}`,
        inline: false,
      },
      {
        name: "Auto Archive Time",
        value: `${thread.autoArchiveDuration}` || "unknown",
        inline: false,
      },
      {
        name: "Link",
        value: `${thread.url}`,
        inline: false,
      }
    );

  try {
    if (!logData && settingsData.Store === true) {
      await logs.create({
        Guild: thread.guild.id,
        Thread: thread.id,
        Name: thread.name,
        User: thread.ownerId,
        Parent: thread.parent,
        Auto: thread.autoArchiveDuration,
        Locked: thread.locked,
        Archived: thread.archived,
      });
    }
    if (settingsData.Post === true) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.log("Error in ThreadCreate event:", error);
  }
});

client.on(Events.ThreadDelete, async (thread) => {
  const settingsData = await settings.findOne({
    Guild: thread.guild.id,
  });
  if (settingsData.Threads === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: thread.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    Guild: thread.guild.id,
    Thread: thread.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ • ID: ${thread.id}` })
    .setTitle("Thread Deleted")
    .addFields(
      {
        name: "Name",
        value: `${thread.name}`,
        inline: false,
      },
      {
        name: "Creator",
        value: `${thread.ownerId ? logData.User : "unknown"}`,
        inline: false,
      },
      {
        name: "Channel",
        value: `${thread.parent ? logData.Parent : "none"}`,
        inline: false,
      },
      {
        name: "Auto Archive Time",
        value: `${thread.autoArchiveDuration ? logData.Auto : "unknown"}`,
        inline: false,
      },
      {
        name: "Link",
        value: `${thread.url}`,
        inline: false,
      }
    );

  try {
    if (logData && settingsData.Store === true) {
      await logs.deleteMany({
        Guild: thread.guild.id,
        Thread: thread.id,
      });
    }
    if (settingsData.Post === true) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.log("Error in ThreadDelete event:", error);
  }
});

client.on(Events.ThreadUpdate, async (oldThread, newThread) => {
  const settingsData = await settings.findOne({
    Guild: newThread.guild.id,
  });
  if (settingsData.Threads === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: oldThread.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    Guild: newThread.guild.id,
    Thread: newThread.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setFooter({ text: `FKZ • ID: ${newThread.id}` })
    .setTimestamp()
    .setTitle("Thread Edited");

  try {
    if (!logData && settingsData.Store === true) {
      await logs.create({
        Guild: newThread.guild.id,
        Thread: newThread.id,
        Name: newThread.name,
        User: newThread.ownerId,
        Parent: newThread.parent,
        Auto: newThread.autoArchiveDuration,
        Locked: newThread.locked,
        Archived: newThread.archived,
      });
    }

    if (oldThread.name !== newThread.name) {
      embed.addFields({
        name: "Name",
        value: `\`${oldThread.name}\` → \`${newThread.name}\``,
        inline: false,
      });
      if (logData && settingsData.Store === true) {
        await logs.findOneAndUpdate(
          {
            Guild: newThread.guild.id,
            Thread: newThread.id,
          },
          {
            Name: newThread.name,
          }
        );
      }
      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
    }

    if (oldThread.archived !== newThread.archived) {
      if (
        oldThread.archived === null &&
        newThread.archived === null &&
        logData.Archived === null
      ) {
        return;
      }

      embed.addFields({
        name: "Archived",
        value: `\`${oldThread.archived ? logData.Archived : "none"}\` → \`${
          newThread.archived || "none"
        }\``,
        inline: false,
      });
      if (logData && settingsData.Store === true) {
        await logs.findOneAndUpdate(
          {
            Guild: newThread.guild.id,
            Thread: newThread.id,
          },
          {
            Archived: newThread.archived,
          }
        );
      }
      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
    }

    if (oldThread.locked !== newThread.locked) {
      if (
        oldThread.locked === null &&
        newThread.locked === null &&
        logData.Locked === null
      ) {
        return;
      }

      embed.addFields({
        name: "Locked",
        value: `\`${oldThread.locked ? logData.Locked : "none"}\` → \`${
          newThread.locked || "none"
        }\``,
        inline: false,
      });
      if (logData && settingsData.Store === true) {
        await logs.findOneAndUpdate(
          {
            Guild: newThread.guild.id,
            Thread: newThread.id,
          },
          {
            Locked: newThread.locked,
          }
        );
      }
      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
    }

    if (oldThread.autoArchiveDuration !== newThread.autoArchiveDuration) {
      if (
        oldThread.autoArchiveDuration === null &&
        newThread.autoArchiveDuration === null &&
        logData.Auto === null
      ) {
        return;
      }

      embed.addFields({
        name: "Auto Archive",
        value: `\`${oldThread.autoArchiveDuration}\` → \`${newThread.autoArchiveDuration}\``,
        inline: false,
      });
      if (logData && settingsData.Store === true) {
        await logs.findOneAndUpdate(
          {
            Guild: newThread.guild.id,
            Thread: newThread.id,
          },
          {
            Auto: newThread.autoArchiveDuration,
          }
        );
      }
      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.log("Error in ThreadUpdate event:", error);
  }
});

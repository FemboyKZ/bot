const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/emojis.js");
const { client } = require("../index.js");

client.on(Events.GuildEmojiCreate, async (emoji) => {
  const data = await schema.findOne({
    Guild: emoji.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    Guild: emoji.guild.id,
    Emoji: emoji.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setImage(emoji.imageURL({ size: 128 }) || logData.Image)
    .setFooter({ text: `FKZ • ID: ${emoji.id}` })
    .setTitle("Emoji Added")
    .addFields(
      {
        name: "Name",
        value: emoji.name ? logData.Name : "Unknown",
        inline: false,
      },
      {
        name: "Author",
        value: emoji.author ? logData.User : "Unknown",
        inline: false,
      },
      {
        name: "Animated?",
        value: emoji.animated ? logData.Animated : "Unknown",
        inline: false,
      }
    );
  try {
    if (logData) {
      await logs.findOneAndUpdate(
        { Guild: emoji.guild.id, Emoji: emoji.id },
        {
          Name: emoji.name,
          User: emoji.author.id,
          Animated: emoji.animated || null,
          Image: emoji.imageURL({ size: 128 }),
        }
      );
    } else {
      await logs.create({
        Guild: emoji.guild.id,
        Emoji: emoji.id,
        Name: emoji.name,
        User: emoji.author.id,
        Created: emoji.createdAt,
        Animated: emoji.animated,
        Image: emoji.imageURL({ size: 128 }),
      });
    }
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error in EmojiCreate event:", error);
  }
});

client.on(Events.GuildEmojiDelete, async (emoji) => {
  const data = await schema.findOne({
    Guild: emoji.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    Guild: emoji.guild.id,
    Emoji: emoji.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setImage(emoji.imageURL({ size: 128 }) || logData.Image)
    .setFooter({ text: `FKZ • ID: ${emoji.id}` })
    .setTitle("Emoji Deleted")
    .addFields(
      {
        name: "Name",
        value: emoji.name ? logData.Name : "Unknown",
        inline: false,
      },
      {
        name: "Author",
        value: emoji.author ? logData.User : "Unknown",
        inline: false,
      },
      {
        name: "Animated?",
        value: emoji.animated ? logData.Animated : "Unknown",
        inline: false,
      }
    );
  try {
    if (logData) {
      await logs.deleteMany({ Guild: emoji.guild.id, Emoji: emoji.id });
    }
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error in EmojiDelete event:", error);
  }
});

client.on(Events.GuildEmojiUpdate, async (oldEmoji, newEmoji) => {
  const data = await schema.findOne({
    Guild: newEmoji.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    Guild: oldEmoji.guild.id,
    Emoji: oldEmoji.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setImage(emoji.imageURL({ size: 128 }) || logData.Image)
    .setFooter({ text: `FKZ • ID: ${newEmoji.id}` })
    .setTitle("Emoji Edited")
    .addFields({
      name: "Author:",
      value: newEmoji.author ? logData.User : "Unknown",
      inline: false,
    });

  try {
    if (!logData) {
      await logs.create({
        Guild: newEmoji.guild.id,
        Emoji: newEmoji.id,
        Name: newEmoji.name ? oldEmoji.name : null,
        User: newEmoji.author.id ? oldEmoji.author.id : null,
        Animated: newEmoji.animated ? oldEmoji.animated : null,
        Created: newEmoji.createdAt,
        Image: newEmoji.imageURL({ size: 128 }),
      });
    }

    if (oldEmoji.name !== newEmoji.name) {
      embed.addFields({
        name: "Name:",
        value: `\`${oldEmoji.name ? logData.Name : "none"}\` →\`${
          newEmoji.name || "Unknown"
        }\``,
        inline: false,
      });
      if (logData) {
        await logs.findOneAndUpdate(
          { Guild: oldEmoji.guild.id, Emoji: oldEmoji.id },
          { Name: newEmoji.name }
        );
      }
    }

    if (oldEmoji.animated !== newEmoji.animated) {
      embed.addFields({
        name: "Animated:",
        value: `\`${oldEmoji.animated ? logData.Animated : "none"}\` →\`${
          newEmoji.animated || "Unknown"
        }\``,
        inline: false,
      });
      if (logData) {
        await logs.findOneAndUpdate(
          { Guild: oldEmoji.guild.id, Emoji: oldEmoji.id },
          { Animated: newEmoji.animated }
        );
      }
    }

    // 1 instead of 0 cuz added 1 before changes
    if (embed.data().fields.length !== 1) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Error in EmojiUpdate event:", error);
  }
});

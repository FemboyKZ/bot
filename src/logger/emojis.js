const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const { client } = require("../index.js");

client.on(Events.GuildEmojiCreate, async (emoji) => {
  try {
    const data = await schema.findOne({
      Guild: emoji.guild.id,
      ID: "audit-logs",
    });
    const channel = client.channels.cache.get(data.Channel);
    if (!data || !data.Channel || !channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setImage(
        emoji.imageURL({ size: 64 }) || "https://femboy.kz/images/wide.png"
      )
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Emoji Added")
      .addFields(
        {
          name: "Name:",
          value: emoji.name || "?",
          inline: false,
        },
        {
          name: "Author:",
          value: emoji.author ? emoji.author.tag : "unknown",
          inline: false,
        },
        {
          name: "Animated?:",
          value: emoji.animated ? "Yes" : "No",
          inline: false,
        },
        {
          name: "ID:",
          value: emoji.id,
          inline: false,
        }
      );
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.GuildEmojiDelete, async (emoji) => {
  try {
    const data = await schema.findOne({
      Guild: emoji.guild.id,
      ID: "audit-logs",
    });
    const channel = client.channels.cache.get(data.Channel);
    if (!data || !data.Channel || !channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setImage(
        emoji.imageURL({ size: 64 }) || "https://femboy.kz/images/wide.png"
      )
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Emoji Deleted")
      .addFields(
        {
          name: "Name:",
          value: emoji.name || "?",
          inline: false,
        },
        {
          name: "Author:",
          value: emoji.author ? emoji.author.tag : "unknown",
          inline: false,
        },
        {
          name: "Animated?:",
          value: emoji.animated ? "Yes" : "No",
          inline: false,
        },
        {
          name: "ID:",
          value: emoji.id,
          inline: false,
        }
      );
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.GuildEmojiUpdate, async (oldEmoji, newEmoji) => {
  try {
    const data = await schema.findOne({
      Guild: newEmoji.guild.id,
      ID: "audit-logs",
    });
    const channel = client.channels.cache.get(data.Channel);
    if (!data || !data.Channel || !channel) return;

    const changes = [];

    if (oldEmoji.name !== newEmoji.name) {
      changes.push(
        `Name: \`${oldEmoji.name || "none"}\` → \`${newEmoji.name || "none"}\``
      );
    }

    if (changes.length === 0) return;
    const changesText = changes.join("\n");

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setImage(
        newEmoji.imageURL({ size: 64 }) || "https://femboy.kz/images/wide.png"
      )
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Emoji Edited")
      .addFields(
        {
          name: "Changes:",
          value: changesText,
          inline: false,
        },
        {
          name: "Author:",
          value: newEmoji.author ? newEmoji.author.tag : "null",
          inline: false,
        },
        {
          name: "ID:",
          value: newEmoji.id,
          inline: false,
        }
      );
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
  }
});

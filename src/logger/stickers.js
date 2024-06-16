const { EmbedBuilder, Events } = require("discord.js");
const Audit_Log = require("../Schemas/auditlog.js");
const { client } = require("../index.js");

client.on(Events.GuildStickerCreate, async (sticker) => {
  try {
    const data = await Audit_Log.findOne({ Guild: sticker.guild.id });
    if (!data) return;
    const logID = data.Channel;
    const auditChannel = client.channels.cache.get(logID);
    if (!auditChannel) return;
    let image =
      sticker.imageURL({ size: 64 }) || "https://femboy.kz/images/wide.png";

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setImage(image)
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Sticker Added")
      .addFields(
        {
          name: "Name:",
          value: `${sticker.name}`,
          inline: false,
        },
        {
          name: "Description:",
          value: `${sticker.description || "none"}`,
          inline: false,
        },
        {
          name: "Format:",
          value: `${sticker.format || "none"}`,
          inline: false,
        },
        {
          name: "ID:",
          value: `${sticker.id}`,
          inline: false,
        }
      );
    await auditChannel.send({ embeds: [auditEmbed] });
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.GuildStickerDelete, async (sticker) => {
  try {
    const data = await Audit_Log.findOne({ Guild: sticker.guild.id });
    if (!data) return;
    const logID = data.Channel;
    const auditChannel = client.channels.cache.get(logID);
    if (!auditChannel) return;
    let image =
      sticker.url({ size: 128 }) || "https://femboy.kz/images/wide.png";

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setImage(image)
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Sticker Deleted")
      .addFields(
        { name: "Name:", value: `${sticker.name}`, inline: false },
        { name: "ID:", value: `${sticker.id}`, inline: false }
      );
    await auditChannel.send({ embeds: [auditEmbed] });
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.GuildStickerUpdate, async (oldSticker, newSticker) => {
  try {
    const data = await Audit_Log.findOne({ Guild: newSticker.guild.id });
    if (!data) return;
    const logID = data.Channel;
    const auditChannel = client.channels.cache.get(logID);
    if (!auditChannel) return;
    const changes = [];

    if (oldSticker.name !== newSticker.name) {
      changes.push(`Name: \`${oldSticker.name}\` → \`${newSticker.name}\``);
    }
    if (oldSticker.description !== newSticker.description) {
      changes.push(
        `Description: \`${oldSticker.description || "None"}\` → \`${
          newSticker.description || "None"
        }\``
      );
    }

    if (changes.length === 0) return;
    const changesText = changes.join("\n");
    let image =
      newSticker.url({ size: 128 }) || "https://femboy.kz/images/wide.png";

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setImage(image)
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Sticker Edited")
      .addFields(
        { name: "Changes:", value: `${changesText}`, inline: false },
        { name: "ID:", value: `${newSticker.id}`, inline: false }
      );
    await auditChannel.send({ embeds: [auditEmbed] });
  } catch (error) {
    console.error(error);
  }
});

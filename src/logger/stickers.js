const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/stickers.js");
const { client } = require("../index.js");

client.on(Events.GuildStickerCreate, async (sticker) => {
  const data = await schema.findOne({
    //Guild: sticker.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    //Guild: sticker.guild.id,
    Sticker: sticker.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ • ID: ${sticker.id}` })
    .setTitle("Sticker Created")
    .addFields(
      {
        name: "Name",
        value: `${sticker.name}`,
        inline: false,
      },
      {
        name: "Description",
        value: `${sticker.description ? logData.Description : "none"}`,
        inline: false,
      },
      {
        name: "Format",
        value: `${sticker.format}`,
        inline: false,
      }
    );
  try {
    if (!logData) {
      await logs.create({
        Guild: sticker.guild.id,
        Sticker: sticker.id,
        Name: sticker.name,
        Description: sticker.description,
        Created: sticker.createdAt,
        Available: sticker.available,
      });
    }
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error in StickerCreate event:", error);
  }
});

client.on(Events.GuildStickerDelete, async (sticker) => {
  const data = await schema.findOne({
    //Guild: sticker.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    //Guild: sticker.guild.id,
    Sticker: sticker.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ • ID: ${sticker.id}` })
    .setTitle("Sticker Deleted")
    .addFields(
      { name: "Name", value: `${sticker.name}`, inline: false },
      {
        name: "Created",
        value: `${sticker.createdAt}`,
        inline: false,
      }
    );
  try {
    if (logData) {
      await logs.deleteMany({
        Guild: sticker.guild.id,
        Sticker: sticker.id,
      });
    }
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error in StickerDelete event:", error);
  }
});

client.on(Events.GuildStickerUpdate, async (oldSticker, newSticker) => {
  const data = await schema.findOne({
    //Guild: newSticker.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    //Guild: newSticker.guild.id,
    Sticker: newSticker.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ • ID: ${newSticker.id}` })
    .setTitle("Sticker Edited");

  try {
    if (!logData) {
      await logs.create({
        Guild: newSticker.guild.id,
        Sticker: newSticker.id,
        Name: newSticker.name,
        Description: newSticker.description,
        Created: newSticker.createdAt,
        Available: newSticker.available,
      });
    }

    if (oldSticker.name !== newSticker.name) {
      embed.addFields({
        name: "Name",
        value: `\`${oldSticker.name}\` → \`${newSticker.name}\``,
        inline: false,
      });
      if (logData) {
        await logs.findOneAndUpdate(
          {
            Guild: newSticker.guild.id,
            Sticker: newSticker.id,
          },
          {
            Name: newSticker.name,
          }
        );
      }
    }
    if (oldSticker.description !== newSticker.description) {
      embed.addFields({
        name: "Description",
        value: `\`${
          oldSticker.description ? logData.Description : "none"
        }\` → \`${newSticker.description || "none"}\``,
        inline: false,
      });
      if (logData) {
        await logs.findOneAndUpdate(
          {
            Guild: newSticker.guild.id,
            Sticker: newSticker.id,
          },
          {
            Description: newSticker.description,
          }
        );
      }
    }

    if (oldSticker.available !== newSticker.available) {
      embed.addFields({
        name: "Available",
        value: `\`${oldSticker.available}\` → \`${newSticker.available}\``,
        inline: false,
      });
      if (logData) {
        await logs.findOneAndUpdate(
          {
            Guild: newSticker.guild.id,
            Sticker: newSticker.id,
          },
          {
            Available: newSticker.available,
          }
        );
      }
    }

    if (embed.data().fields.length === 0)
      console.log("Sticker Edited, No Fields");

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
  }
});

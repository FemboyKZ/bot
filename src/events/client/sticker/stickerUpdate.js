const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/stickers.js");
const settings = require("../../../schemas/events/settings.js");

module.exports = {
  name: Events.GuildStickerUpdate,
  async execute(oldSticker, newSticker, client) {
    const settingsData = await settings.findOne({
      Guild: newSticker.guild.id,
    });
    if (settingsData.Stickers === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

    const auditlogData = await schema.findOne({
      //Guild: newSticker.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

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
      if (!logData && settingsData.Store === true) {
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
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            {
              Guild: newSticker.guild.id,
              Sticker: newSticker.id,
            },
            {
              Name: newSticker.name,
            },
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
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
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            {
              Guild: newSticker.guild.id,
              Sticker: newSticker.id,
            },
            {
              Description: newSticker.description,
            },
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldSticker.available !== newSticker.available) {
        embed.addFields({
          name: "Available",
          value: `\`${oldSticker.available}\` → \`${newSticker.available}\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            {
              Guild: newSticker.guild.id,
              Sticker: newSticker.id,
            },
            {
              Available: newSticker.available,
            },
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error("Error in StickerUpdate event:", error);
    }
  },
};

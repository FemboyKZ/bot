const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/baseSystem.js");
const logs = require("../../../schemas/events/stickers.js");

module.exports = {
  name: Events.GuildStickerUpdate,
  async execute(oldSticker, newSticker, client) {
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
            },
          );
        }
        await channel.send({ embeds: [embed] });
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
            },
          );
        }
        await channel.send({ embeds: [embed] });
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
            },
          );
        }
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error in StickerUpdate event:", error);
    }
  },
};

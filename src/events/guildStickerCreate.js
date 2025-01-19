const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/stickers.js");
const settings = require("../Schemas/logger/settings.js");

module.exports = {
  name: Events.GuildStickerCreate,
  async execute(sticker, client) {
    const settingsData = await settings.findOne({
      Guild: sticker.guild.id,
    });
    if (settingsData.Stickers === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

    const auditlogData = await schema.findOne({
      //Guild: sticker.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

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
      if (!logData && settingsData.Store === true) {
        await logs.create({
          Guild: sticker.guild.id,
          Sticker: sticker.id,
          Name: sticker.name,
          Description: sticker.description,
          Created: sticker.createdAt,
          Available: sticker.available,
        });
      }

      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error in StickerCreate event:", error);
    }
  },
};

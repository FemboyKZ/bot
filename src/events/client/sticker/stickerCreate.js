const { Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const { fkzEmbed } = require("../../../utils/embeds.js");
const logs = require("../../../schemas/events/stickers.js");

module.exports = {
  name: Events.GuildStickerCreate,
  async execute(sticker, client) {
    const channel = await getAuditChannel(sticker.guild, client);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: sticker.guild.id,
      Sticker: sticker.id,
    });

    const embed = fkzEmbed()
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
          value: (sticker.description || "none").slice(0, 1024),
          inline: false,
        },
        {
          name: "Format",
          value: `${sticker.format}`,
          inline: false,
        },
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
  },
};

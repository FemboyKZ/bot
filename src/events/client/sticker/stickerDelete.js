const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/stickers.js");

module.exports = {
  name: Events.GuildStickerDelete,
  async execute(sticker, client) {
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
      .setTitle("Sticker Deleted")
      .addFields(
        { name: "Name", value: `${sticker.name}`, inline: false },
        {
          name: "Created",
          value: `${sticker.createdAt}`,
          inline: false,
        },
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
  },
};

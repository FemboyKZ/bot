const { EmbedBuilder, Events } = require("discord.js");
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const logs = require("../../../schemas/events/guilds.js");

module.exports = {
  name: Events.GuildCreate,
  async execute(guild, client) {
    const channel = await getAuditChannel(guild, client);
    if (!channel) return;

    const owner = await client.users.fetch(guild.ownerId).catch(() => null);

    const logData = await logs.findOne({
      Guild: guild.id,
      User: guild.ownerId,
    });

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("FKZ Bot has joined a new server.")
      .addFields([
        {
          name: "Server",
          value: `> ${guild.name}`,
        },
        {
          name: "Server Membercount",
          value: `> ${guild.memberCount}`,
        },
        {
          name: "Server Owner",
          value: `> ${owner?.username || "Unknown"} / ${guild.ownerId}`,
        },
        {
          name: "Server Age",
          value: `> <t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
        },
      ])
      .setTimestamp()
      .setFooter({ text: `Guild Joined - ${guild.id}` });

    try {
      if (!logData) {
        await logs.create({
          Guild: guild.id,
          Name: guild.name,
          User: guild.ownerId,
          Created: guild.createdTimestamp,
          Icon: guild.iconURL({ dynamic: true }),
          Banner: guild.bannerURL({ dynamic: true }) || null,
          Vanity: guild.vanityURLCode || null,
          Channels: guild.channels.cache.map((channel) => channel.id),
          Emojis: guild.emojis.cache.map((emoji) => emoji.id),
          Stickers: guild.stickers.cache.map((sticker) => sticker.id),
          Roles: guild.roles.cache.map((role) => role.id),
          Members: guild.members.cache.map((member) => member.id),
        });
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in GuildCreate event:", error);
    }
  },
};

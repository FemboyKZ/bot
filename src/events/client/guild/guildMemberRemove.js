const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/baseSystem.js");
const logs = require("../../../schemas/events/members.js");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member, client) {
    if (!member || !client) {
      return;
    }

    const auditlogData = await schema.findOne({
      Guild: member.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: member.guild.id,
      User: member.user.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ • ID: ${member.user.id}` })
      .setTitle(`${member.user.username} has left the server`)
      .setDescription(`<@${member.user.id}> has left the Server`);

    if (logData && logData.Avatar) {
      embed.setAuthor({
        name: `Member Left`,
        iconURL: member.user.avatarURL({ size: 256 })
          ? logData.Avatar
          : "https://files.femboy.kz/web/images/avatars/unknown.png",
      });
    } else {
      embed.setAuthor({
        name: `Member Left`,
        iconURL:
          member.user.avatarURL({ size: 256 }) ||
          "https://files.femboy.kz/web/images/avatars/unknown.png",
      });
    }

    try {
      if (logData) {
        await logs.deleteMany({
          Guild: member.guild.id,
          User: member.user.id,
        });
      }
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Error in guildMemberRemove event:`, error);
    }
  },
};

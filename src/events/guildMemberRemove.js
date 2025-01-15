const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/members.js");
const settings = require("../Schemas/logger/settings.js");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member, client) {
    if (!member || !client) {
      return;
    }

    const settingsData = await settings.findOne({
      Guild: member.guild.id,
    });
    if (settingsData.Members === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

    const data = await schema.findOne({
      Guild: member.guild.id,
      ID: "audit-logs",
    });
    if (!data || !data.Channel) return;
    const channel = client.channels.cache.get(data.Channel);
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
      if (logData && settingsData.Store === true) {
        await logs.deleteMany({
          Guild: member.guild.id,
          User: member.user.id,
        });
      }
      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error(`Error in guildMemberRemove event:`, error);
    }
  },
};

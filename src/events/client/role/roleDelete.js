const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/baseSystem.js");
const logs = require("../../../schemas/events/roles.js");

module.exports = {
  name: Events.GuildRoleCreate,
  async execute(role, client) {
    const auditlogData = await schema.findOne({
      Guild: role.guild?.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: role.guild.id,
      Role: role.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: `FKZ • ID: ${role.id}` })
      .setTitle("Role Deleted")
      .addFields({ name: "Role", value: `<@&${role.id}>`, inline: false });

    try {
      if (logData) {
        await logs.deleteMany({
          Guild: role.guild.id,
          Role: role.id,
        });
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.log("Error in RoleDelete event:", error);
    }
  },
};

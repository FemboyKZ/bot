const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/roles.js");

module.exports = {
  name: Events.GuildRoleUpdate,
  async execute(oldRole, newRole, client) {
    const auditlogData = await schema.findOne({
      Guild: oldRole.guild.id,
      ID: "audit-logs",
    });
    if (!auditlogData || !auditlogData.Channel) return;
    const channel = await client.channels.cache.get(auditlogData.Channel);
    if (!channel) return;

    const logData = await logs.findOne({
      Guild: oldRole.guild.id,
      Role: oldRole.id,
    });

    const oldPerms = await oldRole.permissions.toArray();
    const newPerms = await newRole.permissions.toArray();

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("Role Updated")
      .setFooter({ text: `FKZ • ID: ${newRole.id}` });

    try {
      if (!logData) {
        await logs.create({
          Guild: newRole.guild.id,
          Role: newRole.id,
          Name: newRole.name,
          Color: newRole.hexColor,
          Permissions: newPerms,
          Created: newRole.createdAt,
        });
      }

      if (oldRole.name !== newRole.name) {
        embed.addFields({
          name: "Name",
          value: `\`${oldRole.name}\` → \`${newRole.name}\``,
          inline: false,
        });
        if (logData) {
          await logs.findOneAndUpdate(
            { Guild: oldRole.guild.id, Role: oldRole.id },
            { Name: newRole.name },
          );
        }
        await channel.send({ embeds: [embed] });
      }

      if (oldPerms !== newPerms) {
        embed.addFields({
          name: "Permissions",
          value: `\`${oldPerms.join(", ")}\` → \`${newPerms.join(", ")}\``,
          inline: false,
        });
        if (logData) {
          await logs.findOneAndUpdate(
            { Guild: oldRole.guild.id, Role: oldRole.id },
            { Permissions: newPerms },
          );
        }
        await channel.send({ embeds: [embed] });
      }

      if (oldRole.mentionable !== newRole.mentionable) {
        embed.addFields({
          name: "Mentionable?",
          value: `\`${oldRole.mentionable}\` → \`${newRole.mentionable}\``,
          inline: false,
        });
        if (logData) {
          await logs.findOneAndUpdate(
            { Guild: oldRole.guild.id, Role: oldRole.id },
            { Mentionable: newRole.mentionable },
          );
        }
        await channel.send({ embeds: [embed] });
      }

      if (oldRole.hoist !== newRole.hoist) {
        embed.addFields({
          name: "Hoisted?",
          value: `\`${oldRole.hoist}\` → \`${newRole.hoist}\``,
          inline: false,
        });
        if (logData) {
          await logs.findOneAndUpdate(
            { Guild: oldRole.guild.id, Role: oldRole.id },
            { Hoist: newRole.hoist },
          );
        }
        await channel.send({ embeds: [embed] });
      }

      if (oldRole.hexColor !== newRole.hexColor) {
        embed.addFields({
          name: "Color",
          value: `\`${oldRole.hexColor}\` → \`${newRole.hexColor}\``,
          inline: false,
        });
        if (logData) {
          await logs.findOneAndUpdate(
            { Guild: oldRole.guild.id, Role: oldRole.id },
            { Color: newRole.hexColor },
          );
        }
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.log("Error in RoleUpdate event:", error);
    }
  },
};

const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/roles.js");
const settings = require("../../../schemas/events/settings.js");

module.exports = {
  name: Events.GuildRoleUpdate,
  async execute(oldRole, newRole, client) {
    const settingsData = await settings.findOne({
      Guild: newRole.guild.id,
    });
    if (settingsData.Roles === false) return;
    if (settingsData.Store === false && settingsData.Post === false) return;

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
      if (!logData && settingsData.Store === true) {
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
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: oldRole.guild.id, Role: oldRole.id },
            { Name: newRole.name },
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldPerms !== newPerms) {
        embed.addFields({
          name: "Permissions",
          value: `\`${oldPerms.join(", ")}\` → \`${newPerms.join(", ")}\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: oldRole.guild.id, Role: oldRole.id },
            { Permissions: newPerms },
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldRole.mentionable !== newRole.mentionable) {
        embed.addFields({
          name: "Mentionable?",
          value: `\`${oldRole.mentionable}\` → \`${newRole.mentionable}\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: oldRole.guild.id, Role: oldRole.id },
            { Mentionable: newRole.mentionable },
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldRole.hoist !== newRole.hoist) {
        embed.addFields({
          name: "Hoisted?",
          value: `\`${oldRole.hoist}\` → \`${newRole.hoist}\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: oldRole.guild.id, Role: oldRole.id },
            { Hoist: newRole.hoist },
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }

      if (oldRole.hexColor !== newRole.hexColor) {
        embed.addFields({
          name: "Color",
          value: `\`${oldRole.hexColor}\` → \`${newRole.hexColor}\``,
          inline: false,
        });
        if (logData && settingsData.Store === true) {
          await logs.findOneAndUpdate(
            { Guild: oldRole.guild.id, Role: oldRole.id },
            { Color: newRole.hexColor },
          );
        }
        if (settingsData.Post === true) {
          await channel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.log("Error in RoleUpdate event:", error);
    }
  },
};

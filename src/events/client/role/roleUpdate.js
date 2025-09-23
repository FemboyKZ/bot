const { EmbedBuilder, Events, PermissionFlagsBits } = require("discord.js");
const schema = require("../../../schemas/base-system.js");
const logs = require("../../../schemas/events/roles.js");

module.exports = {
  name: Events.GuildRoleUpdate,
  async execute(oldRole, newRole, client) {
    try {
      const auditlogData = await schema.findOne({
        Guild: oldRole.guild.id,
        ID: "audit-logs",
      });

      if (!auditlogData?.Channel) return;

      const channel = client.channels.cache.get(auditlogData.Channel);
      if (!channel) return;

      let logData = await logs.findOne({
        Guild: oldRole.guild.id,
        Role: oldRole.id,
      });

      if (!logData) {
        logData = await logs.create({
          Guild: newRole.guild.id,
          Role: newRole.id,
          Name: newRole.name,
          Color: newRole.hexColor,
          Permissions: newRole.permissions.toArray(),
          Mentionable: newRole.mentionable,
          Hoist: newRole.hoist,
          Created: newRole.createdAt,
        });
      }

      const changes = [];
      const updateFields = {};

      if (oldRole.name !== newRole.name) {
        changes.push({
          name: "Name",
          value: `\`${oldRole.name}\` → \`${newRole.name}\``,
          inline: false,
        });
        updateFields.Name = newRole.name;
      }

      const oldPerms = oldRole.permissions.toArray();
      const newPerms = newRole.permissions.toArray();

      if (JSON.stringify(oldPerms) !== JSON.stringify(newPerms)) {
        const added = newPerms.filter((p) => !oldPerms.includes(p));
        const removed = oldPerms.filter((p) => !newPerms.includes(p));

        let permissionText = "";
        if (added.length > 0) {
          permissionText += `**Added:** ${added.join(", ")}\n`;
        }
        if (removed.length > 0) {
          permissionText += `**Removed:** ${removed.join(", ")}`;
        }

        changes.push({
          name: "Permissions",
          value: permissionText || "No net changes",
          inline: false,
        });
        updateFields.Permissions = newPerms;
      }

      if (oldRole.mentionable !== newRole.mentionable) {
        changes.push({
          name: "Mentionable",
          value: `\`${oldRole.mentionable}\` → \`${newRole.mentionable}\``,
          inline: true,
        });
        updateFields.Mentionable = newRole.mentionable;
      }

      if (oldRole.hoist !== newRole.hoist) {
        changes.push({
          name: "Hoisted",
          value: `\`${oldRole.hoist}\` → \`${newRole.hoist}\``,
          inline: true,
        });
        updateFields.Hoist = newRole.hoist;
      }

      if (oldRole.hexColor !== newRole.hexColor) {
        changes.push({
          name: "Color",
          value: `\`${oldRole.hexColor}\` → \`${newRole.hexColor}\``,
          inline: true,
        });
        updateFields.Color = newRole.hexColor;
      }

      if (changes.length === 0) return;

      if (Object.keys(updateFields).length > 0) {
        await logs.findOneAndUpdate(
          { Guild: oldRole.guild.id, Role: oldRole.id },
          updateFields,
          { upsert: true },
        );
      }

      const embed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setTitle("🛠️ Role Updated")
        .setDescription(`Role: ${newRole}`)
        .addFields(changes)
        .setFooter({ text: `FKZ • Role ID: ${newRole.id}` });

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in GuildRoleUpdate event:", error);
    }
  },
};

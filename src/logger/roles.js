const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const { client } = require("../index.js");

client.on(Events.GuildRoleCreate, async (role) => {
  const data = await schema.findOne({
    Guild: role.guild?.id,
    ID: "audit-logs",
  });
  if (!data) return;
  const logID = data.Channel;
  const auditChannel = client.channels.cache.get(logID);
  if (!auditChannel) return;

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Role Created")
    .addFields(
      { name: "Name:", value: `${role.name}`, inline: false },
      { name: "Role:", value: `<@&${role.id}>`, inline: false },
      { name: "ID:", value: `${role.id}`, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});

client.on(Events.GuildRoleDelete, async (role) => {
  const data = await schema.findOne({
    Guild: role.guild?.id,
    ID: "audit-logs",
  });
  if (!data) return;
  const logID = data.Channel;
  const auditChannel = client.channels.cache.get(logID);
  if (!auditChannel) return;

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Role Deleted")
    .addFields(
      { name: "Name:", value: `${role.name}`, inline: false },
      { name: "Role:", value: `<@&${role.id}>`, inline: false },
      { name: "ID:", value: `${role.id}`, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});

client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
  const data = await schema.findOne({
    Guild: newRole.guild?.id,
    ID: "audit-logs",
  });
  if (!data) return;
  const logID = data.Channel;
  const auditChannel = client.channels.cache.get(logID);
  if (!auditChannel) return;

  const changes = [];

  if (oldRole.name !== newRole.name) {
    changes.push(`Name: \`${oldRole.name}\` → \`${newRole.name}\``);
  }

  if (oldRole.permissions?.bitfield !== newRole.permissions?.bitfield) {
    changes.push(
      `Permissions: \`${oldRole.permissions?.bitfield || "None"}\` → \`${
        newRole.permissions?.bitfield || "None"
      }\``
    );
  }

  if (oldRole.mentionable !== newRole.mentionable) {
    changes.push(
      `Mentionable?: \`${oldRole.mentionable || "None"}\` → \`${
        newRole.mentionable || "None"
      }\``
    );
  }

  if (oldRole.hoist !== newRole.hoist) {
    changes.push(
      `Hoisted?: \`${oldRole.hoist || "None"}\` → \`${
        newRole.hoist || "None"
      }\``
    );
  }

  if (oldRole.color !== newRole.color) {
    changes.push(
      `Color: \`${oldRole.color + " - " + (oldRole.hexColor || "None")}\` → \`${
        newRole.color + " - " + (newRole.hexColor || "None")
      }\``
    );
  }

  if (changes.length === 0) return;
  const changesText = changes.join("\n");

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setTitle("Role Updated")
    .setFooter({ text: "FKZ Log System" })
    .addFields(
      { name: "Changes:", value: `${changesText}`, inline: false },
      { name: "Role:", value: `<@&${newRole.id}>`, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});

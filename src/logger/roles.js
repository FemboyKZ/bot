const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/roles.js");
const { client } = require("../index.js");

client.on(Events.GuildRoleCreate, async (role) => {
  const data = await schema.findOne({
    Guild: role.guild?.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    Guild: role.guild.id,
    Role: role.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ • ID: ${role.id}` })
    .setTitle("Role Created")
    .addFields(
      { name: "Name", value: `${role.name}`, inline: false },
      { name: "Role", value: `<@&${role.id}>`, inline: false },
      { name: "Color", value: `${role.hexColor}`, inline: false },
      { name: "Hoisted?", value: `${role.hoist}`, inline: false },
      { name: "Mentionable?", value: `${role.mentionable}`, inline: false }
    );
  try {
    if (!logData) {
      await logs.create({
        Guild: role.guild.id,
        Role: role.id,
        Name: role.name,
        Color: role.hexColor,
        Created: role.createdAt,
      });
    }
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.log("Error in RoleCreate event:", error);
  }
});

client.on(Events.GuildRoleDelete, async (role) => {
  const data = await schema.findOne({
    Guild: role.guild?.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

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
});

client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
  const data = await schema.findOne({
    Guild: oldRole.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const logData = await logs.findOne({
    Guild: oldRole.guild.id,
    Role: oldRole.id,
  });

  const oldPerms = oldRole.permissions.toArray();
  const newPerms = newRole.permissions.toArray();

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setTitle("Role Updated")
    .setFooter({ text: `FKZ • ID: ${newRole.id}` });

  if (oldRole.name !== newRole.name) {
    embed.addFields({
      name: "Name",
      value: `\`${oldRole.name}\` → \`${newRole.name}\``,
      inline: false,
    });
    if (logData) {
      await logs.findOneAndUpdate(
        { Guild: oldRole.guild.id, Role: oldRole.id },
        { Name: newRole.name }
      );
    }
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
        { Permissions: newPerms }
      );
    }
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
        { Mentionable: newRole.mentionable }
      );
    }
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
        { Hoist: newRole.hoist }
      );
    }
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
        { Color: newRole.hexColor }
      );
    }
  }

  try {
    if (embed.data().fields.length === 0) console.log("Role Edited, No Fields");
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.log("Error in RoleUpdate event:", error);
  }
});

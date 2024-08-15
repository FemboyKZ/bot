const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/roles.js");
const settings = require("../Schemas/logger/settings.js");
const { client } = require("../index.js");

client.on(Events.GuildRoleCreate, async (role) => {
  const settingsData = await settings.findOne({
    Guild: role.guild.id,
  });
  if (settingsData.Roles === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: role.guild?.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
  if (!channel) return;

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
    if (!logData && settingsData.Store === true) {
      await logs.create({
        Guild: role.guild.id,
        Role: role.id,
        Name: role.name,
        Color: role.hexColor,
        Created: role.createdAt,
      });
    }
    if (settingsData.Post === true) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.log("Error in RoleCreate event:", error);
  }
});

client.on(Events.GuildRoleDelete, async (role) => {
  const settingsData = await settings.findOne({
    Guild: role.guild.id,
  });
  if (settingsData.Roles === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: role.guild?.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
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
    if (logData && settingsData.Store === true) {
      await logs.deleteMany({
        Guild: role.guild.id,
        Role: role.id,
      });
    }

    if (settingsData.Post === true) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.log("Error in RoleDelete event:", error);
  }
});

client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
  const settingsData = await settings.findOne({
    Guild: newRole.guild.id,
  });
  if (settingsData.Roles === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: oldRole.guild.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
  if (!channel) return;

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
          { Name: newRole.name }
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
          { Permissions: newPerms }
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
          { Mentionable: newRole.mentionable }
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
          { Hoist: newRole.hoist }
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
          { Color: newRole.hexColor }
        );
      }
      if (settingsData.Post === true) {
        await channel.send({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.log("Error in RoleUpdate event:", error);
  }
});

const { Events } = require("discord.js");
require("dotenv").config();
const { getAuditChannel } = require("../../../utils/auditChannel.js");
const logs = require("../../../schemas/events/members.js");
const { fkzEmbed } = require("../../../utils/embeds.js");

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember, client) {
    try {
      const data = await logs.findOne({
        Guild: newMember.guild.id,
        User: newMember.id,
      });

      if (!data) {
        await logs.create({
          Guild: newMember.guild.id,
          User: newMember.id,
          Name: newMember.user.username,
          Nickname: newMember.nickname || "",
          Displayname: newMember.displayName || "",
          Avatar: newMember.user.displayAvatarURL({ size: 128 }) || "",
          Banner: newMember.user.bannerURL({ size: 128 }) || "",
          Roles: newMember.roles.cache.map((r) => r.id) || [],
          Joined: newMember.joinedAt || null,
          Created: newMember.user.createdAt,
        });
      }

      // Guild-level changes only. User-level fields (username, avatar, banner)
      // are handled by the UserUpdate event. Prefer the actual pre-update
      // snapshot (oldMember) over the DB, which can lag behind reality.
      const oldValues = {
        Nickname: oldMember.nickname ?? data?.Nickname ?? "",
        Displayname: oldMember.displayName || data?.Displayname || "",
        Roles: oldMember.roles?.cache?.map((r) => r.id) || data?.Roles || [],
      };

      const newValues = {
        Nickname: newMember.nickname ?? "",
        Displayname: newMember.displayName || oldValues.Displayname,
        Roles: newMember.roles.cache.map((r) => r.id),
      };

      const changes = [];

      if (oldValues.Nickname !== newValues.Nickname) {
        changes.push({
          field: "Nickname",
          old: oldValues.Nickname,
          new: newValues.Nickname,
        });
      }

      if (oldValues.Displayname !== newValues.Displayname) {
        changes.push({
          field: "Display Name",
          old: oldValues.Displayname,
          new: newValues.Displayname,
        });
      }

      const addedRoles = newValues.Roles.filter(
        (id) => !oldValues.Roles.includes(id),
      );
      const removedRoles = oldValues.Roles.filter(
        (id) => !newValues.Roles.includes(id),
      );
      if (addedRoles.length > 0 || removedRoles.length > 0) {
        changes.push({
          field: "Roles",
          added: addedRoles,
          removed: removedRoles,
        });
      }

      if (changes.length === 0) return;

      const update = {};
      if (oldValues.Nickname !== newValues.Nickname) {
        update.Nickname = newValues.Nickname;
      }
      if (oldValues.Displayname !== newValues.Displayname) {
        update.Displayname = newValues.Displayname;
      }
      if (JSON.stringify(newValues.Roles) !== JSON.stringify(data?.Roles)) {
        update.Roles = newValues.Roles;
      }

      if (Object.keys(update).length > 0) {
        await logs.updateOne(
          { Guild: newMember.guild.id, User: newMember.id },
          update,
          { upsert: true },
        );
      }

      const embed = fkzEmbed()
        .setAuthor({
          name: `${newMember.user.tag} (${newMember.id})`,
        })
        .setTitle("Member Profile Updated");

      changes.forEach((change) => {
        if (change.field === "Roles") {
          if (change.added.length > 0) {
            embed.addFields({
              name: "Roles Added",
              value: change.added
                .map((id) => `<@&${id}>`)
                .join(", ")
                .slice(0, 1024),
              inline: true,
            });
          }
          if (change.removed.length > 0) {
            embed.addFields({
              name: "Roles Removed",
              value: change.removed
                .map((id) => `<@&${id}>`)
                .join(", ")
                .slice(0, 1024),
              inline: true,
            });
          }
        } else {
          const oldValue = change.old?.toString().slice(0, 1024) || "None";
          const newValue = change.new?.toString().slice(0, 1024) || "None";
          embed.addFields({
            name: change.field,
            value: `**Before:** ${oldValue}\n**After:** ${newValue}`,
            inline: false,
          });
        }
      });

      const channel = await getAuditChannel(newMember.guild, client);
      if (!channel) return;

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(
        "Error handling GuildMemberUpdate for user",
        newMember.id,
        error.stack,
      );
    }
  },
};

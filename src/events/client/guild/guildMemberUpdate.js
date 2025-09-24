const { EmbedBuilder, Events } = require("discord.js");
require("dotenv").config();
const schema = require("../../../schemas/baseSystem.js");
const logs = require("../../../schemas/events/members.js");

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
          Avatar: newMember.user.displayAvatarURL() || "",
          Banner: newMember.user.bannerURL() || "",
          Roles: newMember.roles.cache.map((r) => r.id) || [],
          Joined: newMember.joinedAt || null,
          Created: newMember.user.createdAt,
        });
      }

      const oldValues = {
        Name: data?.Name || oldMember.user.username,
        Nickname: data?.Nickname || oldMember.nickname || "",
        Displayname: data?.Displayname || oldMember.displayName || "",
        Avatar: data?.Avatar || oldMember.user.displayAvatarURL() || "",
        Roles: data?.Roles || oldMember.roles.cache.map((r) => r.id),
      };

      await newMember.user.fetch({ force: true });
      const newAvatar = newMember.user.displayAvatarURL();
      const backupAvatar =
        "https://files.femboy.kz/web/images/avatars/unknown.png";
      const newBanner = newMember.user.bannerURL();

      const newValues = {
        Name: newMember.user.username,
        Nickname: newMember.nickname || oldValues.Nickname,
        Displayname: newMember.displayName || oldValues.Displayname,
        Avatar: newAvatar || backupAvatar,
        Banner: newBanner || "",
        Roles: newMember.roles.cache.map((r) => r.id),
      };

      const changes = [];

      if (oldValues.Name !== newValues.Name) {
        changes.push({
          field: "Username",
          old: oldValues.Name,
          new: newValues.Name,
        });
      }

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

      if (oldValues.Avatar !== newValues.Avatar) {
        changes.push({
          field: "Avatar",
          old: oldValues.Avatar,
          new: newValues.Avatar,
        });
      }

      if ((data?.Banner || null) !== newBanner) {
        changes.push({
          field: "Banner",
          old: data?.Banner || null,
          new: newBanner,
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

      if (changes.length === 0) {
        console.log(
          "Member profile updated, no changes detected. Member: ",
          newMember.id,
        );
        return;
      }

      const update = {};
      const existingData = data || {};

      const hasChanged = (field) =>
        newValues[field] !== existingData[field] &&
        newValues[field] !== null &&
        newValues[field] !== undefined;

      if (hasChanged("Name")) update.Name = newValues.Name;
      if (hasChanged("Nickname")) update.Nickname = newValues.Nickname;
      if (hasChanged("Displayname")) update.Displayname = newValues.Displayname;
      if (hasChanged("Avatar")) update.Avatar = newValues.Avatar;
      if (hasChanged("Banner")) update.Banner = newValues.Banner;
      if (
        JSON.stringify(newValues.Roles) !== JSON.stringify(existingData.Roles)
      ) {
        update.Roles = newValues.Roles;
      }

      update.Joined = newMember.joinedAt;
      update.Created = newMember.user.createdAt;

      const minUpdates = 2;

      if (Object.keys(update).length > minUpdates) {
        await logs.findOneAndUpdate(
          { Guild: newMember.guild.id, User: newMember.id },
          update,
          { upsert: true, new: true },
        );
      }

      const embed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setAuthor({
          name: `${newMember.user.tag} (${newMember.id})`,
        })
        .setTitle("Member Profile Updated")
        .setTimestamp();

      changes.forEach((change) => {
        if (change.field === "Roles") {
          const added =
            change.added.map((id) => `<@&${id}>`).join(", ") || "None";
          const removed =
            change.removed.map((id) => `<@&${id}>`).join(", ") || "None";

          if (added.length > 0) {
            embed.addFields({
              name: "Roles Added",
              value: added,
              inline: true,
            });
          }
          if (removed.length > 0) {
            embed.addFields({
              name: "Roles Removed",
              value: removed,
              inline: true,
            });
          }
        } else if (change.field === "Avatar") {
          embed
            .addFields({
              name: "Avatar",
              value: `[Old](<${oldValues.Avatar}>)\n[New](<${newValues.Avatar}>)`,
              inline: true,
            })
            .setThumbnail(newValues.Avatar);
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

      const auditlogData = await schema.findOne({
        Guild: newMember.guild.id,
        ID: "audit-logs",
      });
      if (!auditlogData || !auditlogData.Channel) return;
      const channel = await client.channels.cache.get(auditlogData.Channel);
      if (!channel) return;

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(
        "Error handling GuildMemberUpdate for user",
        newMember.id,
        "Changes detected:",
        error.stack,
      );
    }
  },
};

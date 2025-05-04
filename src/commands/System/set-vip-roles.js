const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const schema = require("../../schemas/vip/vipRoles.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-vip-roles")
    .setDescription("[Admin] Set or update the VIP roles")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("role-vip")
        .setDescription("Set or update the VIP Role")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("role-vip-plus")
        .setDescription("Set or update the VIP+ Role")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("role-contributor")
        .setDescription("Set or update the Contributor Role")
        .setRequired(false),
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "You don't have permissions to use this command.",
        ephemeral: true,
      });
    }

    try {
      const guild = interaction.guild;
      const roles = {
        vip: interaction.options.getString("role-vip"),
        vipPlus: interaction.options.getString("role-vip-plus"),
        contributor: interaction.options.getString("role-contributor"),
      };

      if (!Object.values(roles).some((role) => role)) {
        return interaction.reply({
          content: "Please provide at least one role to set.",
          ephemeral: true,
        });
      }

      const operations = [];
      const roleTypes = [
        { type: "vip", role: roles.vip },
        { type: "vip+", role: roles.vipPlus },
        { type: "contributor", role: roles.contributor },
      ];

      for (const { type, role } of roleTypes) {
        if (role) {
          operations.push(
            schema.findOneAndUpdate(
              { Guild: guild.id, Type: type },
              { $set: { Role: role } },
              { upsert: true, new: true },
            ),
          );
        }
      }

      await Promise.all(operations);

      return interaction.reply({
        content: "Roles have been successfully updated!",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error in set-vip-roles:", error);
      return interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};

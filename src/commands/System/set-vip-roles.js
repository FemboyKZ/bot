const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const schema = require("../../Schemas/vip/vip-roles.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-vip-roles")
    .setDescription("[Admin] Set or change the vip roles")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("role-vip")
        .setDescription("Set or update the VIP Role")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("role-vip-plus")
        .setDescription("Set or update the VIP+ Role")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("role-contributor")
        .setDescription("Set or update the Contributor Role")
        .setRequired(false)
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }

    const { guild } = interaction;
    const roleVip = interaction.options.getString("role-vip");
    const roleVipPlus = interaction.options.getString("role-vip-plus");
    const roleContributor = interaction.options.getString("role-contributor");
    const data = await schema.findOne({ Guild: guild.id });

    try {
      if (!data) {
        if (roleVip) {
          await schema.create({
            Guild: guild.id,
            Role: roleVip,
            Type: "vip",
          });
        }
        if (roleVipPlus) {
          await schema.create({
            Guild: guild.id,
            Role: roleVipPlus,
            Type: "vip+",
          });
        }
        if (roleContributor) {
          await schema.create({
            Guild: guild.id,
            Role: roleContributor,
            Type: "contributor",
          });
        } else {
          await interaction.reply({
            content: `No role has been set.`,
            ephemeral: true,
          });
        }
        await interaction.reply({
          content: "Roles have been set.",
          ephemeral: true,
        });
      }
      if (data) {
        if (roleVip) {
          await schema.findOneAndUpdate(
            {
              Guild: guild.id,
              Type: "vip",
            },
            {
              Role: roleVip,
            }
          );
        }
        if (roleVipPlus) {
          await schema.findOneAndUpdate(
            {
              Guild: guild.id,
              Type: "vip+",
            },
            {
              Role: roleVipPlus,
            }
          );
        }
        if (roleContributor) {
          await schema.findOneAndUpdate(
            {
              Guild: guild.id,
              Type: "contributor",
            },
            {
              Role: roleContributor,
            }
          );
        } else {
          await interaction.reply({
            content: `No role has been set.`,
            ephemeral: true,
          });
        }
        await interaction.reply({
          content: `Roles have been updated.`,
          ephemeral: true,
        });
      }
    } catch (err) {
      console.error("Error executing command:", err);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};

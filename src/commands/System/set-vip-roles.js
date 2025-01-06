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
    const guild = interaction.guild;
    const vipRole = interaction.options.getString("role-vip");
    const vipPlusRole = interaction.options.getString("role-vip-plus");
    const contributorRole = interaction.options.getString("role-contributor");
    const data = await schema.findOne({ Guild: guild.id });

    if (!data) {
      if (vipRole) {
        await schema.create({
          Guild: guild.id,
          Role: vipRole,
          Type: "vip",
        });
      }
      if (vipPlusRole) {
        await schema.create({
          Guild: guild.id,
          Role: vipPlusRole,
          Type: "vip+",
        });
      }
      if (contributorRole) {
        await schema.create({
          Guild: guild.id,
          Role: contributorRole,
          Type: "contributor",
        });
      } else {
        return await interaction.reply({
          content: `No role has been set.`,
          ephemeral: true,
        });
      }
      return await interaction.reply({
        content: "Roles have been set.",
        ephemeral: true,
      });
    }

    if (data) {
      if (vipRole) {
        await schema.findOneAndUpdate(
          {
            Guild: guild.id,
            Type: "vip",
          },
          {
            Role: vipRole,
          }
        );
      }
      if (vipPlusRole) {
        await schema.findOneAndUpdate(
          {
            Guild: guild.id,
            Type: "vip+",
          },
          {
            Role: vipPlusRole,
          }
        );
      }
      if (contributorRole) {
        await schema.findOneAndUpdate(
          {
            Guild: guild.id,
            Type: "contributor",
          },
          {
            Role: contributorRole,
          }
        );
      } else {
        return await interaction.reply({
          content: `No role has been set.`,
          ephemeral: true,
        });
      }
      return await interaction.reply({
        content: `Roles have been updated.`,
        ephemeral: true,
      });
    }
  },
};

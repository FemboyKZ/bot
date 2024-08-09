const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const schema = require("../../Schemas/vip-uses.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-vip-codes")
    .setDescription("[Admin] Set or change the vip codes")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("code-vip")
        .setDescription("Set or update the VIP Code")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("code-vip-plus")
        .setDescription("Set or update the VIP+ Code")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("code-contributor")
        .setDescription("Set or update the Contributor Code")
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
    const codeVip = interaction.options.getString("code-vip");
    const codeVipPlus = interaction.options.getString("code-vip-plus");
    const codeContributor = interaction.options.getString("code-contributor");
    const data = await schema.findOne({ Guild: guild.id });

    try {
      if (!data) {
        if (codeVip) {
          await schema.create({
            Guild: guild.id,
            Code: codeVip,
            Type: "vip",
            Uses: 0,
          });
        }
        if (codeVipPlus) {
          await schema.create({
            Guild: guild.id,
            Code: codeVipPlus,
            Type: "vip+",
            Uses: 0,
          });
        }
        if (codeContributor) {
          await schema.create({
            Guild: guild.id,
            Code: codeContributor,
            Type: "contributor",
            Uses: 0,
          });
        } else {
          await interaction.reply({
            content: `No code has been set.`,
            ephemeral: true,
          });
        }
        await interaction.reply({
          content: "Codes have been set.",
          ephemeral: true,
        });
      }
      if (data) {
        if (codeVip) {
          await schema.findOneAndUpdate(
            {
              Guild: guild.id,
              Type: "vip",
            },
            {
              Code: codeVip,
              Uses: 0,
            }
          );
        }
        if (codeVipPlus) {
          await schema.findOneAndUpdate(
            {
              Guild: guild.id,
              Type: "vip+",
            },
            {
              Code: codeVipPlus,
              Uses: 0,
            }
          );
        }
        if (codeContributor) {
          await schema.findOneAndUpdate(
            {
              Guild: guild.id,
              Type: "contributor",
            },
            {
              Code: codeContributor,
              Uses: 0,
            }
          );
        } else {
          await interaction.reply({
            content: `No code has been set.`,
            ephemeral: true,
          });
        }
        await interaction.reply({
          content: `Codes have been updated.`,
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

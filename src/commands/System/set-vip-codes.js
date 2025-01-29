const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const schema = require("../../schemas/vip/vipUses.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-vip-codes")
    .setDescription("[Admin] Set or change the vip codes")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("code-vip")
        .setDescription("Set or update the VIP Code")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("code-vip-plus")
        .setDescription("Set or update the VIP+ Code")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("code-contributor")
        .setDescription("Set or update the Contributor Code")
        .setRequired(false),
    ),
  async execute(interaction) {
    const guild = interaction.guild;
    const vipCode = interaction.options.getString("code-vip");
    const vipPlusCode = interaction.options.getString("code-vip-plus");
    const contributorCode = interaction.options.getString("code-contributor");

    const data = await schema.findOne({ Guild: guild.id });

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: "You don't have permissions to use this command.",
        ephemeral: true,
      });
    }

    try {
      if (!data) {
        if (vipCode) {
          await schema.create({
            Guild: guild.id,
            Code: vipCode,
            Type: "vip",
            Uses: 0,
          });
        }
        if (vipPlusCode) {
          await schema.create({
            Guild: guild.id,
            Code: vipPlusCode,
            Type: "vip+",
            Uses: 0,
          });
        }
        if (contributorCode) {
          await schema.create({
            Guild: guild.id,
            Code: contributorCode,
            Type: "contributor",
            Uses: 0,
          });
        } else {
          return interaction.reply({
            content: "No code has been set.",
            ephemeral: true,
          });
        }
        return await interaction.reply({
          content: "Codes have been set.",
          ephemeral: true,
        });
      }

      if (vipCode) {
        await schema.findOneAndUpdate(
          {
            Guild: guild.id,
            Type: "vip",
          },
          {
            Code: vipCode,
            Uses: 0,
          },
        );
      }
      if (vipPlusCode) {
        await schema.findOneAndUpdate(
          {
            Guild: guild.id,
            Type: "vip+",
          },
          {
            Code: vipPlusCode,
            Uses: 0,
          },
        );
      }
      if (contributorCode) {
        await schema.findOneAndUpdate(
          {
            Guild: guild.id,
            Type: "contributor",
          },
          {
            Code: contributorCode,
            Uses: 0,
          },
        );
      } else {
        return await interaction.reply({
          content: "No code has been set.",
          ephemeral: true,
        });
      }
      return await interaction.reply({
        content: "Codes have been updated.",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error executing command:", error);
      return await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};

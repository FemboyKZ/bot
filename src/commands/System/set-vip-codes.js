const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const schema = require("../../schemas/vip/vipUses.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-vip-codes")
    .setDescription("[Admin] Set or Update the VIP codes")
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
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: "You don't have permissions to use this command.",
        ephemeral: true,
      });
    }

    try {
      const guild = interaction.guild;
      const codes = {
        vip: await interaction.options.getString("code-vip"),
        vipPlus: await interaction.options.getString("code-vip-plus"),
        contributor: await interaction.options.getString("code-contributor"),
      };

      if (!Object.values(codes).some((code) => code)) {
        return await interaction.reply({
          content: "Please provide at least one code to set.",
          ephemeral: true,
        });
      }

      const operations = [];
      const codeTypes = [
        { type: "vip", code: codes.vip },
        { type: "vip+", code: codes.vipPlus },
        { type: "contributor", code: codes.contributor },
      ];

      for (const { type, code } of codeTypes) {
        if (code) {
          operations.push(
            schema.findOneAndUpdate(
              { Guild: guild.id, Type: type },
              { $set: { Code: code, Uses: 0 } },
              { upsert: true, new: true },
            ),
          );
        }
      }

      await Promise.all(operations);

      return await interaction.reply({
        content: "Codes have been successfully updated!",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error in set-vip-codes:", error);
      return interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};

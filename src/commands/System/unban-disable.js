const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const unbanSchema = require("../../Schemas/unbans");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban-disable")
    .setDescription("[Admin] Disable the unban system"),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }
    const { guildId } = interaction;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setDescription(`The unban system has been disabled.`);

    unbanSchema.deleteMany({ Guild: guildId });

    return await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

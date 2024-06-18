const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const whitelistSchema = require("../../Schemas/whitelistSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-disable")
    .setDescription("[Admin] Disable the whitelist system"),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { guildId } = interaction;

    const embed = new EmbedBuilder();

    whitelistSchema.deleteMany(
      { Guild: guildId }.then(async (data) => {
        embed
          .setColor("#ff00b3")
          .setDescription(`The whitelist system has been disabled.`);

        return await interaction.reply({ embeds: [embed], ephemeral: true });
      })
    );
  },
};

const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const whitelistSchema = require("../../Schemas.js/whitelistSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-disable")
    .setDescription("[Admin] Disable the whitelist system"),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { guildId } = interaction;

    const embed = new EmbedBuilder();

    whitelistSchema.deleteMany({ Guild: guildId }, async (err, data) => {
      embed
        .setColor("#ff00b3")
        .setDescription(`The whitelist system has been disabled.`);

      return await interaction.reply({ embeds: [embed] });
    });
  },
};

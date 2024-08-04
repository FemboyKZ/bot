const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const mcWhitelistSchema = require("../../Schemas/mcWhitelist");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mc-whitelist-disable")
    .setDescription("[Admin] Disable the Minecraft whitelist system"),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { guildId } = interaction;

    const embed = new EmbedBuilder();

    mcWhitelistSchema.deleteMany({ Guild: guildId }, async (err, data) => {
      embed
        .setColor("#ff00b3")
        .setDescription(`The whitelist system has been disabled.`);

      return await interaction.reply({ embeds: [embed] });
    });
  },
};

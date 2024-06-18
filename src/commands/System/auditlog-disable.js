const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Schema = require("../../Schemas/auditlog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("auditlog-disable")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("[Admin] Disable the audit log system in your server"),
  async execute(interaction) {
    const { options, guild } = interaction;

    const data = await Schema.findOne({
      Guild: guild.id,
    });
    if (!data) {
      return await interaction.reply("You dont have a audit log system here!");
    }
    const embed = new EmbedBuilder()
      .setTitle("Audit Log Setup")
      .setDescription(`Your Audit Log has been deleted!`)
      .setColor("#ff00b3");

    await Schema.deleteMany({
      Guild: guild.id,
    });

    return await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};

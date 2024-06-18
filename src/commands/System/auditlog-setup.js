const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Schema = require("../../Schemas/auditlog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("auditlog-setup")
    .setDescription("[Admin] Setup the audit log system in your server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel for the Audit Log")
        .setRequired(true)
    ),
  async execute(interaction) {
    const { options, guild } = interaction;
    const channel = options.getChannel("channel");

    const data = await Schema.findOne({
      Guild: guild.id,
    });
    if (data) {
      return await interaction.reply(
        "You have already a audit log system here!"
      );
    }
    const embed = new EmbedBuilder()
      .setTitle("Audit Log Setup")
      .setDescription(`Your Audit Log has been Setup to ${channel}`)
      .setColor("#ff00b3");

    await Schema.create({
      Guild: guild.id,
      Channel: channel.id,
    });

    return await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};

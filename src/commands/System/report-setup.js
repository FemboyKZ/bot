const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const reportSchema = require("../../Schemas/reportSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report-setup")
    .setDescription("[Admin] Setup the report/suggestions system")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription(`The channel for reports/suggestions`)
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { channel, guildId, options } = interaction;
    const reportChannel = options.getChannel("channel");

    const embed = new EmbedBuilder();

    try {
      const data = await reportSchema.findOne({ Guild: guildId });
      if (!data) {
        await reportSchema.create({
          Guild: guildId,
          Channel: reportChannel.id,
        });

        embed
          .setColor("#ff00b3")
          .setDescription(
            `All submitted reports/suggestions requests will be sent in ${reportChannel}`
          );
      } else if (data) {
        const e = client.channels.cache.get(data.Channel);
        embed
          .setColor("#ff00b3")
          .setDescription(
            `Your reports/suggestions channel has already been set to ${e}`
          );
      }

      return await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error("Error executing command:", err);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};

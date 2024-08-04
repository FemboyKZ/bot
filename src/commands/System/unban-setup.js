const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const unbanSchema = require("../../Schemas/unbans");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban-setup")
    .setDescription("[Admin] Setup the unban system")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription(`The channel for unbans`)
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
    const unbanChannel = options.getChannel("channel");

    const embed = new EmbedBuilder();

    try {
      const data = await unbanSchema.findOne({ Guild: guildId });
      if (!data) {
        await unbanSchema.create({
          Guild: guildId,
          Channel: unbanChannel.id,
        });

        embed
          .setColor("#ff00b3")
          .setDescription(
            `All submitted unban requests will be sent in ${unbanChannel}`
          );
      } else if (data) {
        const d = client.channels.cache.get(data.Channel);
        embed
          .setColor("#ff00b3")
          .setDescription(`Your unban channel has already been set to ${d}`);
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

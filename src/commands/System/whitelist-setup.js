const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const whitelistSchema = require("../../Schemas/whitelistSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-setup")
    .setDescription("[Admin] Setup the whitelist system")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription(`The channel`)
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
    const wlChannel = options.getChannel("channel");

    const embed = new EmbedBuilder();

    try {
      const data = await whitelistSchema.findOne({ Guild: guildId });
      if (!data) {
        await whitelistSchema.create({
          Guild: guildId,
          Channel: wlChannel.id,
        });

        embed
          .setColor("#ff00b3")
          .setDescription(
            `All submitted wl requests will be sent in ${wlChannel}`
          );
      } else if (data) {
        const c = client.channels.cache.get(data.Channel);
        embed
          .setColor("#ff00b3")
          .setDescription(`Your wl channel has already been set to ${c}`);
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

const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");
const mcWhitelistSchema = require("../../Schemas.js/mcWhitelistSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mc-whitelist-setup")
    .setDescription("[Admin] Setup the Minecraft whitelist system")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription(`The channel`)
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { channel, guildId, options } = interaction;
    const wlChannel = options.getChannel("channel");

    const embed = new EmbedBuilder();

    mcWhitelistSchema.findOne({ Guild: guildId }, async (err, data) => {
      if (!data) {
        await mcWhitelistSchema.create({
          Guild: guildId,
          Channel: wlChannel.id,
        });

        embed
          .setColor("#ff00b3")
          .setDescription(
            `All submitted wl requests will be sent in ${wlChannel}`
          );
      } else if (data) {
        const c = client.channels.cache.get(data.channel);
        embed
          .setColor("#ff00b3")
          .setDescription(`Your wl channel has already been set to ${c}`);
      }

      return await interaction.reply({ embeds: [embed] });
    });
  },
};

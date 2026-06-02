const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");
const { requireAdmin } = require("../../utils/permissions.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("[Admin] Create a vote poll")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("specify the thing to vote for")
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("channel you would like to send the vote poll to")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!(await requireAdmin(interaction))) return;
    const { options } = interaction;
    const channel = options.getChannel("channel");
    const description = options.getString("description");
    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setDescription(description)
      .setTimestamp();
    try {
      const m = await channel.send({ embeds: [embed] });
      await m.react("✅");
      await m.react("❌");
      await interaction.reply({
        content: "poll was created",
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      console.log(err);
      return;
    }
  },
};

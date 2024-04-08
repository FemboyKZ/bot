const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionsBitField, ChannelType, } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("[Admin] Create a vote poll")
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("specify the thing to vote for")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("channel you would like to send the vote poll to")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
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
      await interaction.reply({ content: "poll was created", ephemeral: true });
    } catch (err) {
      console.log(err);
      return;
    }
  },
};

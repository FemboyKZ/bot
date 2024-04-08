const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("[Admin] Set/Change the bot presence/status")
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription(`Status text`)
        .setMaxLength(128)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Status type")
        .addChoices(
          { name: "Playing", value: `${1}` },
          { name: "Streaming", value: `${2}` },
          { name: "Listening", value: `${3}` },
          { name: "Watching", value: `${4}` },
          { name: "Competing", value: `${6}` }
        )
        .setRequired(true)
    ),
  //.addStringOption(option => option.setName('url').setDescription(`Stream url (twitch)`).setMaxLength(128).setRequired(false))
  async execute(interaction, client) {
    const { options } = interaction;
    const status = options.getString("status");
    const type = options.getString("type");
    // const url = options.getString('url');

    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    else {
      client.user.setActivity({
        name: status,
        type: type - 1,
        url: `https://www.twitch.tv/FemboyKZ`,
      });

      const embed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setDescription(
          `The Bot's status has been set to \`${status}\`, and the type to \`${
            type - 1
          }\``
        );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

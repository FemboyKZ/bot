const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const inviteSchema = require("../../Schemas/invitelog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite-logger")
    .setDescription("[Admin] Set up the invite logging system")
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("[Admin] Set up the invite-logger")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The logging channel")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("[Admin] Disable the invite-logger")
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { options } = interaction;
    const sub = options.getSubcommand();

    const Data = await inviteSchema.findOne({ Guild: interaction.guild.id });

    switch (sub) {
      case "setup":
        const channel = options.getChannel("channel");

        if (Data)
          return await interaction.reply({
            content: `The invite logger is already enabled. Logs will be sent to ${channel}.`,
            ephemeral: true,
          });
        else {
          await inviteSchema.create({
            Guild: interaction.guild.id,
            Channel: channel.id,
          });

          const embed = new EmbedBuilder()
            .setColor("#ff00b3")
            .setDescription(
              `The invite-logger has been enabled, logs will be sent to ${channel}`
            );

          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }

    switch (sub) {
      case "disable":
        if (!Data)
          return await interaction.reply({
            content: "The invite-logger has not been enabled yet.",
            ephemeral: true,
          });
        else {
          await inviteSchema.deleteMany({ Guild: interaction.guild.id });

          const embed = new EmbedBuilder()
            .setColor("#ff00b3")
            .setDescription("The invite-logger has been disabled.");

          await interaction.reply({ embeds: [embed] });
        }
    }
  },
};

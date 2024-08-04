const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const schema = require("../../Schemas/invitelog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite-logs")
    .setDescription("[Admin] Setup the invite logging system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("[Admin] Set up the invite-logs")
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
        .setDescription("[Admin] Disable the invite-logs")
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { guild, options } = interaction;
    const channel = options.getChannel("channel");
    const sub = options.getSubcommand();
    const data = await schema.findOne({ Guild: guild });

    const embed = new EmbedBuilder()
      .setTitle("Invite Logs Setup")
      .setColor("#ff00b3")
      .setTimestamp();

    switch (sub) {
      case "setup":
        try {
          if (data)
            embed.setDescription(
              `The invite logger is already enabled. Logs will be sent to ${channel}.`
            );
          else if (!data) {
            embed.setDescription(
              `The invite-logger has been enabled, logs will be sent to ${channel}`
            );
            await schema.create({
              Guild: interaction.guild.id,
              Channel: channel.id,
            });
          }
          return await interaction.reply({
            embeds: [embed],
            ephemeral: true,
          });
        } catch (err) {
          console.error("Error executing command:", err);
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
    }

    switch (sub) {
      case "disable":
        try {
          if (!data)
            embed.setDescription(
              "The invite-logger has not been enabled yet, or is already disabled."
            );
          else if (data) {
            embed.setDescription("The invite-logger has been disabled.");
            await schema.deleteMany({ Guild: guild });
          }
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (err) {
          console.error("Error executing command:", err);
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
    }
  },
};

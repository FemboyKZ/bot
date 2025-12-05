const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");
const schema = require("../../schemas/baseSystem.js");

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
            .addChannelTypes(ChannelType.GuildText),
        ),
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("[Admin] Disable the invite-logs"),
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        flags: MessageFlags.Ephemeral,
      });

    const { guild, options } = interaction;
    const channel = options.getChannel("channel");
    const sub = options.getSubcommand();
    const data = await schema.findOne({ Guild: guild.id, ID: "invite-logs" });

    const embed = new EmbedBuilder()
      .setTitle("Invite Logs Setup")
      .setColor("#ff00b3")
      .setTimestamp();

    switch (sub) {
      case "setup":
        try {
          if (data)
            embed.setDescription(
              `The invite logger is already enabled. Logs will be sent to ${channel}.`,
            );
          else if (!data) {
            embed.setDescription(
              `The invite-logger has been enabled, logs will be sent to ${channel}`,
            );
            await schema.create({
              Guild: guild.id,
              Channel: channel.id,
              ID: "invite-logs",
            });
          }
          return await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
          });
        } catch (err) {
          console.error("Error executing command:", err);
          await interaction.reply({
            content: "There was an error while executing this command!",
            flags: MessageFlags.Ephemeral,
          });
        }
        break;

      case "disable":
        try {
          if (!data)
            embed.setDescription(
              "The invite-logger has not been enabled yet, or is already disabled.",
            );
          else if (data) {
            embed.setDescription("The invite-logger has been disabled.");
            await schema.deleteMany({ Guild: guild.id, ID: "invite-logs" });
          }
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (err) {
          console.error("Error executing command:", err);
          await interaction.reply({
            content: "There was an error while executing this command!",
            flags: MessageFlags.Ephemeral,
          });
        }
    }
  },
};

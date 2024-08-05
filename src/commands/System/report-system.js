const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const schema = require("../../Schemas/reports");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report-system")
    .setDescription("[Admin] Setup the report/suggestions system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("[Admin] Setup the report/suggestions system")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel for reports/suggestions")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("[Admin] Disable the report/suggestions system")
    ),
  async execute(interaction, client) {
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
      .setTitle("Report Setup")
      .setColor("#ff00b3")
      .setTimestamp();

    switch (sub) {
      case "setup":
        try {
          if (!data) {
            embed.setDescription(
              `All submitted reports/suggestions requests will be sent in ${channel}`
            );
            await schema.create({
              Guild: guild,
              Channel: channel.id,
            });
          } else if (data) {
            const existingChannel = client.channels.cache.get(data.Channel);
            embed.setDescription(
              `Your reports/suggestions channel has already been set to ${existingChannel}`
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
        break;

      case "disable":
        try {
          if (!data) {
            embed.setDescription(
              `The reports/suggestions system has already been disabled.`
            );
          } else if (data) {
            embed.setDescription(
              `The reports/suggestions system has been disabled.`
            );
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

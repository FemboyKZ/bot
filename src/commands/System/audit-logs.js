const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const Schema = require("../../Schemas/auditlog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("audit-logs")
    .setDescription("[Admin] Setup the audit log system in your server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("[Admin] Setup the audit-logs")
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
        .setDescription("[Admin] Disable the audit-logs")
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { options, guild } = interaction;
    const channel = options.getChannel("channel");
    const sub = options.getSubcommand();

    const data = await Schema.findOne({
      Guild: guild.id,
    });

    const embed = new EmbedBuilder()
      .setTitle("Audit Log Setup")
      .setColor("#ff00b3")
      .setTimestamp();

    switch (sub) {
      case "setup":
        try {
          if (data) {
            embed.setDescription("You have already a audit log system here!");
          } else if (!data) {
            embed.setDescription(`Your Audit Log has been Setup to ${channel}`);
            await Schema.create({
              Guild: guild.id,
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

      case "disable":
        try {
          if (!data) {
            embed.setDescription("You dont have a audit log system here!");
          } else if (data) {
            embed.setDescription(`Your Audit Log has been deleted!`);
            await Schema.deleteMany({
              Guild: guild.id,
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
  },
};

const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const schema = require("../../schemas/base-system.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-system")
    .setDescription("[Admin] Setup the whitelist system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("[Admin] Setup the whitelist system")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel for whitelist requests")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText),
        ),
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("[Admin] Disable the whitelist system"),
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
    const data = await schema.findOne({ Guild: guild.id, ID: "whitelist" });

    const embed = new EmbedBuilder()
      .setTitle("Whitelist System Setup")
      .setColor("#ff00b3")
      .setTimestamp();

    switch (sub) {
      case "setup":
        try {
          if (!data) {
            embed.setDescription(
              `All submitted wl requests will be sent in ${channel}`,
            );
            await schema.create({
              Guild: guild.id,
              Channel: channel.id,
              ID: "whitelist",
            });
          } else if (data) {
            const existingChannel = client.channels.cache.get(data.Channel);
            embed.setDescription(
              `Your wl channel has already been set to ${existingChannel}`,
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
            embed.setDescription(`The whitelist system is already disabled.`);
          } else if (data) {
            embed.setDescription(`The whitelist system has been disabled.`);
            await schema.deleteMany({
              Guild: guild.id,
              ID: "whitelist",
            });
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

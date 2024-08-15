const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const schema = require("../../Schemas/base-system.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mc-whitelist-system")
    .setDescription("[Admin] Setup the Minecraft whitelist system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("[Admin] Setup the minecraft whitelist system")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel for whitelist requests")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("[Admin] Disable the minecraft whitelist system")
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
    const data = await schema.findOne({ Guild: guild, Channel: channel.id });

    const embed = new EmbedBuilder()
      .setTitle("Minecraft Whitelist System Setup")
      .setColor("#ff00b3")
      .setTimestamp();

    switch (sub) {
      case "setup":
        try {
          if (!data) {
            embed.setDescription(
              `All submitted whitelists requests will be sent in ${channel}`
            );
            await schema.create({
              Guild: guild,
              Channel: channel.id,
            });
          } else if (data) {
            const existingChannel = client.channels.cache.get(data.Channel);
            embed.setDescription(
              `Your wl channel has already been set to ${existingChannel}`
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

      case "disable":
        try {
          if (!data) {
            embed.setDescription(`The whitelist system is already disabled.`);
          } else if (data) {
            embed.setDescription(`The whitelist system has been disabled.`);
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

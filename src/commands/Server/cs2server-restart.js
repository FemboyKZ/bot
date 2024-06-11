const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cs2server-restart")
    .setDescription("[Admin] Send a restart command to a CS:2 server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to restart")
        .setRequired(true)
        .addChoices(
          { name: "CS:2 FKZ 1 - Whitelist", value: "cs2-fkz-1" },
          { name: "CS:2 FKZ 2 - Public KZ", value: "cs2-fkz-2" },
          { name: "CS:2 FKZ 3 - Public MV", value: "cs2-fkz-3" },
          { name: "CS:2 FKZ 4 - Public HNS", value: "cs2-fkz-4" }
        )
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const wait = require("timers/promises").setTimeout;

    const { options } = interaction;
    const server = options.getString("server");

    const command = `sudo -iu ${server} /home/${server}/cs2server restart`;

    try {
      await interaction.reply({
        content: `Restarting: ${server}`,
        ephemeral: true,
      });
      exec(command, async (error, stdout, stderr) => {
        await wait(5000);
        if (error) {
          return await interaction.editReply({
            content: `Error: ${error.message}`,
            ephemeral: true,
          });
        }
        if (stderr) {
          return await interaction.editReply({
            content: `Stderr: ${stderr}`,
            ephemeral: true,
          });
        }
        return await interaction.editReply({
          content: `Restarted: ${server}`,
          ephemeral: true,
        });
      });
    } catch (error) {
      await interaction.editReply({
        content: `Error: ${error}`,
        ephemeral: true,
      });
    }
  },
};

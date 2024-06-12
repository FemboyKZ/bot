const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csclserver-restart")
    .setDescription("[Admin] Send a restart command to a ClassicCounter server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to restart")
        .setRequired(true)
        .addChoices(
          { name: "CS:CL FKZ 1 - VNL 128t", value: "cscl-fkz-1" },
          { name: "CS:CL FKZ 2 - VNL 64t", value: "cscl-fkz-2" }
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

    const command = `sudo -iu ${server} /home/${server}/csgoserver restart`;

    let serverName = server;
    switch (serverName) {
      case "cscl-fkz-1":
        serverName = "CS:CL FKZ 1 - VNL 128t";
        break;
      case "cscl-fkz-2":
        serverName = "CS:CL FKZ 2 - VNL 64t";
        break;
      default:
        serverName = "Unknown";
    }

    try {
      await interaction.reply({
        content: `Restarting: ${serverName}`,
        ephemeral: true,
      });
      exec(command, async (error, stdout, stderr) => {
        await wait(5000);
        if (!interaction) return;
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
          content: `Restarted: ${serverName}`,
          ephemeral: true,
        });
      });
    } catch (error) {
      if (interaction) {
        await interaction.editReply({
          content: `Error: ${error}`,
          ephemeral: true,
        });
      }
    }
  },
};

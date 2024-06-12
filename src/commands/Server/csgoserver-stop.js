const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgoserver-stop")
    .setDescription("[Admin] Send a stop command to a CS:GO server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to stop")
        .setRequired(true)
        .addChoices(
          { name: "CS:GO FKZ 1 - Whitelist 128t", value: "csgo-fkz-1" },
          { name: "CS:GO FKZ 2 - Public 64t", value: "csgo-fkz-2" },
          { name: "CS:GO FKZ 3 - Public Nuke", value: "csgo-fkz-3" }
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

    const command = `sudo -iu ${server} /home/${server}/csgoserver stop`;

    let serverName = server;
    switch (serverName) {
      case "csgo-fkz-1":
        serverName = "CS:GO FKZ 1 - Whitelist 128t";
        break;
      case "csgo-fkz-2":
        serverName = "CS:GO FKZ 2 - Public 64t";
        break;
      case "csgo-fkz-3":
        serverName = "CS:GO FKZ 3 - Public Nuke";
        break;
      default:
        serverName = "Unknown";
    }

    try {
      await interaction.reply({
        content: `Stopping: ${serverName}`,
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
          content: `Stopped: ${serverName}`,
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

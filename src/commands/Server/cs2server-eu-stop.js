const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cs2server-eu-stop")
    .setDescription("[Admin] Send a STOP command to a EU CS:2 server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to stop")
        .setRequired(true)
        .addChoices(
          { name: "CS:2 FKZ 1 - Whitelist", value: "cs2-fkz-1" },
          { name: "CS:2 FKZ 2 - Public KZ", value: "cs2-fkz-2" },
          { name: "CS:2 FKZ 3 - Public MV", value: "cs2-fkz-3" },
          { name: "CS:2 FKZ 4 - Public HNS", value: "cs2-fkz-4" },
          { name: "CS:2 FKZ 5 - Testing", value: "cs2-fkz-5" }
        )
    ),
  async execute(interaction) {
    const { options } = interaction;
    const server = options.getString("server");

    const command = `sudo -iu ${server} /home/${server}/cs2server stop`;

    let serverName = server;
    switch (serverName) {
      case "cs2-fkz-1":
        serverName = "CS:2 FKZ 1 - Whitelist";
        break;
      case "cs2-fkz-2":
        serverName = "CS:2 FKZ 2 - Public KZ";
        break;
      case "cs2-fkz-3":
        serverName = "CS:2 FKZ 3 - Public MV";
        break;
      case "cs2-fkz-4":
        serverName = "CS:2 FKZ 4 - Public HNS";
        break;
      case "cs2-fkz-5":
        serverName = "CS:2 FKZ 5 - Testing";
        break;
      default:
        serverName = "Unknown";
    }

    if (
      interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
      interaction.member.roles.cache.has(`${process.env.CS2_MANAGER_ROLE}`)
    ) {
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
    } else {
      await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }
  },
};

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgosomali-start")
    .setDescription(
      "[Pirate] Send a START command to a Somali Pirates CS:GO server"
    )
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to start")
        .setRequired(true)
        .addChoices(
          { name: "Somali Pirates 1", value: "csgo-somali-1" },
          { name: "Somali Pirates 2", value: "csgo-somali-2" }
        )
    ),

  async execute(interaction) {
    const { options } = interaction;
    const server = options.getString("server");

    const command = `sudo -iu ${server} /home/${server}/csgoserver start`;

    let serverName = server;
    switch (serverName) {
      case "csgo-somali-1":
        serverName = "Somali Pirates 1";
        break;
      case "csgo-somali-2":
        serverName = "Somali Pirates 2";
        break;
      default:
        serverName = "Unknown";
    }

    try {
      await interaction.reply({
        content: `Starting: ${serverName}`,
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
          content: `Started: ${serverName}`,
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

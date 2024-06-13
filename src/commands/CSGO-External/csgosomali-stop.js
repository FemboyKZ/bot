const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgosomali-stop")
    .setDescription(
      "[Pirate] Send a stop command to a Somali Pirates CS:GO server"
    )
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to stop")
        .setRequired(true)
        .addChoices(
          { name: "Somali Pirates 1", value: "csgo-somali-1" },
          { name: "Somali Pirates 2", value: "csgo-somali-2" }
        )
    ),

  async execute(interaction) {
    const { options } = interaction;
    const server = options.getString("server");

    const command = `sudo -iu ${server} /home/${server}/csgoserver stop`;

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

    if (
      interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
      interaction.member.roles.cache.has(`${process.env.PIRATE_MANAGER_ROLE}`)
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
        content: `You do not have permission to use this command.`,
        ephemeral: true,
      });
    }
  },
};

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Send a STOP command to a Somali Pirates CS:GO server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to stop")
        .setRequired(true)
        .addChoices(
          { name: "Somali Pirates 1", value: "csgo-somali-1" },
          { name: "Somali Pirates 2", value: "csgo-somali-2" },
          { name: "Somali Pirates Public", value: "csgo-somali-3" }
        )
    ),

  async execute(interaction) {
    const { options } = interaction;
    const servers = options.getString("server");

    const server = {
      "csgo-somali-1": {
        name: "Somali Pirates 1",
        user: "csgo-somali-1",
      },
      "csgo-somali-2": {
        name: "Somali Pirates 2",
        user: "csgo-somali-2",
      },
      "csgo-somali-3": {
        name: "Somali Pirates Public",
        user: "csgo-somali-3",
      },
    }[servers];

    const { name, user } = server;

    if (
      //!interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
      !interaction.member.roles.cache.has(`${process.env.BOT_MANAGER_ROLE}`)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }

    try {
      await interaction.reply({
        content: `Stopping: ${name}`,
        ephemeral: true,
      });
      exec(
        `sudo -iu ${user} /home/${user}/csgoserver stop`,
        async (error, stdout, stderr) => {
          if (error) console.log(error);
          //if (stderr) console.log(stderr);
          //if (stdout) console.log(stdout);
        }
      );
      await wait(3000);
      return await interaction.editReply({
        content: `Stopped: ${name}`,
        ephemeral: true,
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

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("somali-start")
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
    const servers = options.getString("server");

    const server = {
      "csgo-somali-1": {
        name: "Somali Pirates 1",
        id: null,
      },
      "csgo-somali-2": {
        name: "Somali Pirates 2",
        id: null,
      },
    }[servers];

    const { name, id } = server;

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
      !interaction.member.roles.cache.has(`${process.env.SALAD_MANAGER_ROLE}`)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }

    try {
      await interaction.reply({
        content: `Starting: ${name}`,
        ephemeral: true,
      });
      exec(
        `sudo -iu ${server} /home/${server}/csgoserver start`,
        async (error, stdout, stderr) => {
          if (error) console.log(error);
          //if (stderr) console.log(stderr);
          //if (stdout) console.log(stdout);
          await wait(3000);
          return await interaction.editReply({
            content: `Started: ${name}`,
            ephemeral: true,
          });
        }
      );
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

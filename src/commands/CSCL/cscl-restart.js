const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

const username = process.env.DATHOST_USERNAME;
const password = process.env.DATHOST_PASSWORD;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cscl-restart")
    .setDescription(
      "[Admin] Send a RESTART command to a FKZ ClassicCounter server"
    )
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
    const { options } = interaction;
    const servers = options.getString("server");

    const server = {
      "cscl-fkz-1": {
        name: "CS:CL FKZ 1 - VNL 128t",
        user: "cscl-fkz-1",
        id: null,
      },
      "cscl-fkz-2": {
        name: "CS:CL FKZ 2 - VNL 64t",
        user: "cscl-fkz-2",
        id: null,
      },
    }[servers];

    const { name, user, id } = server;

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
      !interaction.member.roles.cache.has(`${process.env.CSCL_MANAGER_ROLE}`)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }

    try {
      await interaction.reply({
        content: `Restarting: ${name}`,
        ephemeral: true,
      });
      exec(
        `sudo -iu ${user} /home/${user}/csgoserver restart`,
        async (error, stdout, stderr) => {
          if (error) console.log(error);
          //if (stderr) console.log(stderr);
          //if (stdout) console.log(stdout);
        }
      );
      await wait(3000);
      return await interaction.editReply({
        content: `Restarted: ${name}`,
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

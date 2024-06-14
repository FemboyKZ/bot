const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

const username = process.env.DATHOST_USERNAME;
const password = process.env.DATHOST_PASSWORD;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgo-na-restart")
    .setDescription("[Admin] Send a RESTART command to a NA CS:GO server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to restart")
        .setRequired(true)
        .addChoices(
          { name: "CS:GO FKZ 1 - Whitelist 128t", value: "csgo-fkz-1" },
          { name: "CS:GO FKZ 2 - Public 64t", value: "csgo-fkz-2" }
        )
    ),

  async execute(interaction) {
    const { options } = interaction;
    const servers = options.getString("server");

    const server = {
      "csgo-fkz-1": {
        name: "CS:GO FKZ 1 - Whitelist 128t",
        id: process.env.NA_CSGO_WL_SERVERID,
      },
      "csgo-fkz-2": {
        name: "CS:GO FKZ 2 - Public 64t",
        id: process.env.NA_CSGO_64_SERVERID,
      },
    }[servers];

    if (!server) {
      await interaction.reply({
        content: "Unknown server.",
        ephemeral: true,
      });
      return;
    }

    const { name, id } = server;

    const urlStop = `https://dathost.net/api/0.1/game-servers/${id}/stop`;
    const commandStop = `curl -u "${username}:${password}" --request POST \--url ${urlStop}`;

    const urlStart = `https://dathost.net/api/0.1/game-servers/${id}/start`;
    const commandStart = `curl -u "${username}:${password}" --request POST \--url ${urlStart}`;

    const statusUrl = `https://dathost.net/api/0.1/game-servers/${id}`;
    const statusCommand = `curl -u "${username}:${password}" --request GET \--url ${statusUrl} \--header 'accept: application/json'`;

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) &&
      !interaction.member.roles.cache.has(process.env.CS2_MANAGER_ROLE)
    ) {
      await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.reply({
        content: `Restarting: ${name}`,
        ephemeral: true,
      });
      exec(commandStop, async (error, stdout, stderr) => {
        if (error) console.log(error);
        //if (stderr) console.log(stderr);
        //if (stdout) console.log(stdout);
        await interaction.reply({
          content: `Stopped: ${name}`,
          ephemeral: true,
        });
      });
      await wait(3000);
      exec(commandStart, async (error, stdout, stderr) => {
        if (error) console.log(error);
        //if (stderr) console.log(stderr);
        //if (stdout) console.log(stdout);
        await interaction.reply({
          content: `Started: ${name}`,
          ephemeral: true,
        });
      });
      await wait(3000);
      exec(statusCommand, async (error, stdout, stderr) => {
        if (error) console.log(error);
        //if (stderr) console.log(stderr);
        //if (stdout) console.log(stdout);
        if (stdout.includes(`"on":true`)) {
          return await interaction.editReply({
            content: `Restarted: ${name}`,
            ephemeral: true,
          });
        } else {
          return await interaction.editReply({
            content: `(Probably) Restarted: ${name}`,
            ephemeral: true,
          });
        }
      });
    } catch (error) {
      await interaction.editReply({
        content: `Error: ${error}`,
        ephemeral: true,
      });
    }
  },
};

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

const username = process.env.DATHOST_USERNAME;
const password = process.env.DATHOST_PASSWORD;
const headers = {
  authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
    "base64"
  )}`,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgo-na-start")
    .setDescription("[Admin] Send a START command to a NA CS:GO server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to start")
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

    const url = `https://dathost.net/api/0.1/game-servers/${id}/start`;
    const command = `curl -u "${username}:${password}" --request POST \--url ${url}`;

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
        content: `Starting: ${name}`,
        ephemeral: true,
      });
      exec(command, async (error, stdout, stderr) => {
        if (error) console.log(error);
        //if (stderr) console.log(stderr);
        //if (stdout) console.log(stdout);
      });
      await wait(3000);
      exec(statusCommand, async (error, stdout, stderr) => {
        if (error) console.log(error);
        //if (stderr) console.log(stderr);
        //if (stdout) console.log(stdout);
        if (stdout.includes(`"on":true`)) {
          return await interaction.editReply({
            content: `Started: ${name}`,
            ephemeral: true,
          });
        } else {
          return await interaction.editReply({
            content: `(Probably) Started: ${name}`,
            ephemeral: true,
          });
        }
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
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

const username = process.env.DATHOST_USERNAME;
const password = process.env.DATHOST_PASSWORD;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cs2-na-start")
    .setDescription("[Admin] Send a START command to a NA CS:GO server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to start")
        .setRequired(true)
        .addChoices(
          { name: "CS2 FKZ 1 - Public KZ", value: "cs2-fkz-1" },
          { name: "CS2 FKZ 2 - Public MV", value: "cs2-fkz-2" },
          { name: "CS2 FKZ 3 - Public HNS", value: "cs2-fkz-3" }
        )
    ),

  async execute(interaction) {
    const { options } = interaction;
    const servers = options.getString("server");

    const server = {
      "cs2-fkz-1": {
        name: "CS2 FKZ 1 - Public KZ",
        id: process.env.NA_CS2_KZ_SERVERID,
      },
      "cs2-fkz-2": {
        name: "CS2 FKZ 2 - Public MV",
        id: process.env.NA_CS2_MV_SERVERID,
      },
      "cs2-fkz-3": {
        name: "CS2 FKZ 3 - Public HNS",
        id: process.env.NA_CS2_HNS_SERVERID,
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

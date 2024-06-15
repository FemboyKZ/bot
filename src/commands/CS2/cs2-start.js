const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

const username = process.env.DATHOST_USERNAME;
const password = process.env.DATHOST_PASSWORD;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cs2-start")
    .setDescription("[Admin] Send a START command to a FKZ CS2 server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to start")
        .setRequired(true)
        .addChoices(
          { name: "CS2 EU - FKZ 1 - Whitelist", value: "cs2-fkz-1" },
          { name: "CS2 EU - FKZ 2 - Public KZ", value: "cs2-fkz-2" },
          { name: "CS2 EU - FKZ 3 - Public MV", value: "cs2-fkz-3" },
          { name: "CS2 EU - FKZ 4 - Public HNS", value: "cs2-fkz-4" },
          { name: "CS2 EU - FKZ 5 - Testing", value: "cs2-fkz-5" },
          { name: "CS2 NA - FKZ 1 - Public KZ", value: "cs2-fkz-6" },
          { name: "CS2 NA - FKZ 2 - Public MV", value: "cs2-fkz-7" },
          { name: "CS2 NA - FKZ 3 - Public HNS", value: "cs2-fkz-8" }
        )
    ),

  async execute(interaction) {
    const { options } = interaction;
    const servers = options.getString("server");

    const server = {
      "cs2-fkz-1": {
        name: "CS2 EU - FKZ 1 - Whitelist",
        id: null,
      },
      "cs2-fkz-2": {
        name: "CS2 EU - FKZ 2 - Public KZ",
        id: null,
      },
      "cs2-fkz-3": {
        name: "CS2 EU - FKZ 3 - Public MV",
        id: null,
      },
      "cs2-fkz-4": {
        name: "CS2 EU - FKZ 4 - Public HNS",
        id: null,
      },
      "cs2-fkz-5": {
        name: "CS2 EU - FKZ 5 - Testing",
        id: null,
      },
      "cs2-fkz-6": {
        name: "CS2 NA - FKZ 1 - Public KZ",
        id: process.env.NA_CS2_KZ_SERVERID,
      },
      "cs2-fkz-7": {
        name: "CS2 NA - FKZ 1 - Public MV",
        id: process.env.NA_CS2_MV_SERVERID,
      },
      "cs2-fkz-7": {
        name: "CS2 NA - FKZ 1 - Public HNS",
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

    const statusUrl = `https://dathost.net/api/0.1/game-servers/${id}`;
    const statusCommand = `curl -u "${username}:${password}" --request GET \--url ${statusUrl} \--header 'accept: application/json'`;
    // I know curl is not the best way to do this, but it works (node-fetch and axios didn't)
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
      if (id !== null) {
        exec(
          `curl -u "${username}:${password}" --request POST \--url https://dathost.net/api/0.1/game-servers/${id}/start`,
          async (error, stdout, stderr) => {
            if (error) console.log(error);
            //if (stderr) console.log(stderr);
            //if (stdout) console.log(stdout);
          }
        );
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
      } else {
        exec(
          `sudo -iu ${server} /home/${server}/cs2server start`,
          async (error, stdout, stderr) => {
            if (error) console.log(error);
            //if (stderr) console.log(stderr);
            //if (stdout) console.log(stdout);
          }
        );
        await wait(3000);
        return await interaction.editReply({
          content: `Started: ${name}`,
          ephemeral: true,
        });
      }
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

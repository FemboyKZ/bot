const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

const key = process.env.API_KEY;
const port = process.env.API_PORT || 8080;
const apiUrl = new URL(process.env.API_URL);
const url = `${apiUrl.origin}:${port}${apiUrl.pathname}`;

const username = process.env.DATHOST_USERNAME;
const password = process.env.DATHOST_PASSWORD;

const delay = 3000; // 3 seconds, increase if needed, this is set because stdout is not immediately available

// TODO: Check if the server is actually online after starting

// TODO: Only start the server if it's not already running

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
          { name: "CS2 EU - FKZ - Whitelist", value: "cs2-fkz-1" },
          { name: "CS2 EU - FKZ - Public 1 - KZ", value: "cs2-fkz-2" },
          { name: "CS2 EU - FKZ - Public 2 - MV", value: "cs2-fkz-3" },
          { name: "CS2 EU - FKZ - Testing", value: "cs2-fkz-4" },
          { name: "CS2 EU - Maptesting Server By FKZ", value: "cs2-fkz-5" },
          { name: "CS2 NA - FKZ - Public 1 - KZ", value: "cs2-fkz-6" },
          { name: "CS2 NA - FKZ - Public 2 - KZ", value: "cs2-fkz-7" },
          { name: "CS2 NA - FKZ - Public 3 - MV", value: "cs2-fkz-8" },
          { name: "CS2 AS - FKZ - Public KZ", value: "cs2-fkz-9" },
          { name: "CS2 AU - FKZ - Public KZ", value: "cs2-fkz-10" },
          { name: "CS2 SA - FKZ - Public KZ", value: "cs2-fkz-11" },
          { name: "CS2 ZA - FKZ - Public KZ", value: "cs2-fkz-12" }
        )
    ),

  async execute(interaction) {
    const { options } = interaction;
    const servers = options.getString("server");

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("FKZ CS2 Start")
      .setFooter({ text: `FKZ` });

    const server = {
      "cs2-fkz-1": {
        name: "CS2 EU - FKZ - Whitelist",
        user: "fkz-1",
        id: null,
      },
      "cs2-fkz-2": {
        name: "CS2 EU - FKZ - Public 1 - KZ",
        user: "fkz-2",
        id: null,
      },
      "cs2-fkz-3": {
        name: "CS2 EU - FKZ - Public 2 - Movement",
        user: "fkz-3",
        id: null,
      },
      "cs2-fkz-4": {
        name: "CS2 EU - Maptesting Server By FKZ",
        user: "fkz-4",
        id: null,
      },
      "cs2-fkz-5": {
        name: "CS2 EU - FKZ - Testing",
        user: "fkz-5",
        id: null,
      },
      "cs2-fkz-6": {
        name: "CS2 NA - FKZ - Public 1 - KZ",
        user: "fkz-1",
        id: 1,
      },
      "cs2-fkz-7": {
        name: "CS2 NA - FKZ - Public 2 - KZ",
        user: "fkz-2",
        id: 1,
      },
      "cs2-fkz-8": {
        name: "CS2 NA - FKZ - Public 3 - Movement",
        user: "fkz-3",
        id: 1,
      },
      "cs2-fkz-9": {
        name: "CS2 AS - FKZ - Public - KZ",
        user: null,
        id: process.env.AS_CS2KZ_SERVERID,
      },
      "cs2-fkz-10": {
        name: "CS2 AU - FKZ - Public - KZ",
        user: null,
        id: process.env.AU_CS2KZ_SERVERID,
      },
      "cs2-fkz-11": {
        name: "CS2 SA - FKZ - Public - KZ",
        user: null,
        id: process.env.SA_CS2KZ_SERVERID,
      },
      "cs2-fkz-12": {
        name: "CS2 ZA - FKZ - Public - KZ",
        user: null,
        id: process.env.ZA_CS2KZ_SERVERID,
      },
    }[servers];

    if (!server) {
      embed.setDescription(`Unknown server.`);
      return await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    const { name, user, id } = server;

    const dathostUrl = `https://dathost.net/api/0.1/game-servers/${id}`;
    const dathostStatus = `curl -u "${username}:${password}" --request GET \--url ${dathostUrl} \--header 'accept: application/json'`;
    const dathostCommand = `curl -u "${username}:${password}" --request GET \--url ${dathostUrl}/start \--header 'accept: application/json'`;

    const commandLocal = `sudo -iu cs2-${user} /home/cs2-${user}/cs2server start`;
    const commandApi = `curl -X POST -H 'Accept: application/json' -H 'Authorization: ${key}' -H 'Content-Type: application/json' -d '{"user": "${user}", "game": "cs2", "command": "start"}' ${url}`;

    // I know curl is not the best way to do this, but it works (node-fetch and axios didn't)

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) &&
      !interaction.member.roles.cache.has(process.env.CS2_MANAGER_ROLE)
    ) {
      embed.setDescription("You don't have perms to use this command.");
      return await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    try {
      embed.setDescription(`Starting: ${name}`);
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      if (id === null) {
        exec(commandLocal, async (error, stdout, stderr) => {
          if (error) {
            console.log(error);
            embed.setDescription(`There was an error starting ${name}.`);
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          } else {
            embed.setDescription(`Started ${name}.`);
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        });
      } else if (id === 1) {
        if (!url || !key) {
          embed.setDescription("API url and/or key missing.");
          return await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
          });
        }
        exec(commandApi, async (error, stdout, stderr) => {
          await wait(delay);
          if (error) {
            console.log(error);
            embed.setDescription(`There was an error starting ${name}.`);
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          } else {
            embed.setDescription(`Started ${name}.`);
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        });
      } else {
        if (!password || !username) {
          embed.setDescription("Dathost username and/or password missing.");
          return await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
          });
        }
        if (id === undefined) {
          embed.setDescription(`Unknown server.`);
          return await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
          });
        }

        exec(dathostCommand, async (error, stdout, stderr) => {
          await wait(delay);
          if (error) {
            console.log(error);
            embed.setDescription(`There was an error starting ${name}.`);
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        });
        await wait(delay);
        embed.setDescription(`Started ${name}.`);
        await interaction.editReply({
          embeds: [embed],
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error executing command:", error);
      embed.setDescription(`Error: ${error.message}`);
      await interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};

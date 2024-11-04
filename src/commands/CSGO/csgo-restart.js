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

const delay = 3000; // 3 seconds, increase if needed, this is set because stdout is not immediately available

// TODO: Check if the server is actually online after restarting

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgo-restart")
    .setDescription("[Admin] Send a RESTART command to a FKZ CS:GO server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to restart")
        .setRequired(true)
        .addChoices(
          { name: "CS:GO EU - FKZ 1 - Whitelist 128t", value: "csgo-fkz-1" },
          { name: "CS:GO EU - FKZ 2 - Public 64t", value: "csgo-fkz-2" },
          { name: "CS:GO EU - FKZ 3 - Public Nuke", value: "csgo-fkz-3" },
          { name: "CS:GO NA - FKZ 1 - Whitelist 128t", value: "csgo-fkz-4" },
          { name: "CS:GO NA - FKZ 2 - Public 64t", value: "csgo-fkz-5" }
        )
    ),

  async execute(interaction) {
    const { options } = interaction;
    const servers = options.getString("server");

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("FKZ CS:GO Restart")
      .setFooter({ text: `FKZ` });

    const server = {
      "csgo-fkz-1": {
        name: "CS:GO EU - FKZ 1 - Whitelist 128t",
        user: "fkz-1",
        id: null,
      },
      "csgo-fkz-2": {
        name: "CS:GO EU - FKZ 2 - Public 64t",
        user: "fkz-2",
        id: null,
      },
      "csgo-fkz-3": {
        name: "CS:GO EU - FKZ 3 - Public Nuke",
        user: "fkz-3",
        id: null,
      },
      "csgo-fkz-4": {
        name: "CS:GO NA - FKZ 1 - Whitelist 128t",
        user: "fkz-1",
        id: 1,
      },
      "csgo-fkz-5": {
        name: "CS:GO NA - FKZ 2 - Public 64t",
        user: "fkz-2",
        id: 2,
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

    const commandLocal = `sudo -iu csgo-${user} /home/csgo-${user}/csgoserver restart`;
    const commandApi = `curl -X POST -H 'Accept: application/json' -H 'Authorization: ${key}' -H 'Content-Type: application/json' -d '{"user": "${user}", "game": "csgo", "command": "restart"}' ${url}`;

    // I know curl is not the best way to do this, but it works (node-fetch and axios didn't)

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) &&
      !interaction.member.roles.cache.has(process.env.CSGO_MANAGER_ROLE)
    ) {
      embed.setDescription("You don't have perms to use this command.");
      return await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    try {
      embed.setDescription(`Restarting: ${name}`);
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      if (id === null) {
        exec(commandLocal, async (error, stdout, stderr) => {
          if (error) {
            console.log(error);
            embed.setDescription(`There was an error restarting ${name}.`);
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          } else {
            embed.setDescription(`Restarted ${name}.`);
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        });
      } else {
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
            embed.setDescription(`There was an error restarting ${name}.`);
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          } else {
            embed.setDescription(`Restarted ${name}.`);
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          }
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

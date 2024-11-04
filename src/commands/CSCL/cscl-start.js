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

// TODO: Check if the server is actually online after starting

// TODO: Only start the server if it's not already running

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cscl-start")
    .setDescription(
      "[Admin] Send a START command to a FKZ ClassicCounter server"
    )
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to start")
        .setRequired(true)
        .addChoices(
          { name: "CS:CL EU FKZ 1 - VNL KZ 128t", value: "cscl-fkz-1" },
          { name: "CS:CL EU FKZ 2 - VNL KZ 64t", value: "cscl-fkz-2" },
          { name: "CS:CL EU FKZ 3 - KZTimer 128t", value: "cscl-fkz-3" },
          { name: "CS:CL NA FKZ 1 - VNL KZ 128t", value: "cscl-fkz-4" },
          { name: "CS:CL NA FKZ 2 - VNL KZ 64t", value: "cscl-fkz-5" }
        )
    ),

  async execute(interaction) {
    const { options } = interaction;
    const servers = options.getString("server");

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("FKZ ClassicCounter Start")
      .setFooter({ text: `FKZ` });

    const server = {
      "cscl-fkz-1": {
        name: "CS:CL FKZ 1 - VNL KZ 128t",
        user: "fkz-1",
        id: null,
      },
      "cscl-fkz-2": {
        name: "CS:CL FKZ 2 - VNL KZ 64t",
        user: "fkz-2",
        id: null,
      },
      "cscl-fkz-3": {
        name: "CS:CL FKZ 3 - KZTimer 128t",
        user: "fkz-3",
        id: null,
      },
      "cscl-fkz-4": {
        name: "CS:CL NA - FKZ 1 - VNL KZ 128t",
        user: "fkz-1",
        id: 1,
      },
      "cscl-fkz-5": {
        name: "CS:CL NA - FKZ 2 - VNL KZ 64t",
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

    const commandLocal = `sudo -iu cscl-${user} /home/cscl-${user}/csgoserver start`;
    const commandApi = `curl -X POST -H 'Accept: application/json' -H 'Authorization: ${key}' -H 'Content-Type: application/json' -d '{"user": "${user}", "game": "cscl", "command": "start"}' ${url}`;

    // I know curl is not the best way to do this, but it works (node-fetch and axios didn't)

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) &&
      !interaction.member.roles.cache.has(process.env.CSCL_MANAGER_ROLE)
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

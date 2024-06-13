const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fetch = require("node-fetch");
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
    .setName("csgoserver-na-restart")
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

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) &&
      !interaction.member.roles.cache.has(process.env.CSGO_MANAGER_ROLE)
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
      const responseStop = await fetch(
        `https://dathost.net/api/0.1/game-servers/${id}/stop`,
        {
          method: "POST",
          headers,
        }
      );
      await wait(3000);
      if (responseStop.status !== 200) {
        await interaction.editReply(`Error: ${responseStop.statusText}`);
      }
      const responseStart = await fetch(
        `https://dathost.net/api/0.1/game-servers/${id}/start`,
        {
          method: "POST",
          headers,
        }
      );
      await wait(3000);
      if (responseStart.status !== 200) {
        await interaction.editReply(`Error: ${responseStart.statusText}`);
      }
      await interaction.editReply({
        content: `Restarted: ${name}`,
        ephemeral: true,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Error: ${error}`,
        ephemeral: true,
      });
    }
  },
};

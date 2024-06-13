const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const axios = require("axios");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgoserver-na-start")
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
        content: `Starting: ${name}`,
        ephemeral: true,
      });
      const response = await axios.post(
        `https://dathost.net/api/0.1/game-servers/${id}/start`,
        {}
      );
      await wait(5000);
      if (response.status === 200) {
        await interaction.editReply({
          content: `Started: ${name}`,
          ephemeral: true,
        });
      } else {
        await interaction.editReply({
          content: `Error: ${response.data}`,
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
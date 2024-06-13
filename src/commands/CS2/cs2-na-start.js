const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const axios = require("axios");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cs2server-na-start")
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
      const response = await axios.post(
        `https://dathost.net/api/0.1/game-servers/${id}/stop`,
        {}
      );
      await wait(5000);
      if (!interaction) return;
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
      await interaction.editReply({
        content: `Error: ${error}`,
        ephemeral: true,
      });
    }
  },
};

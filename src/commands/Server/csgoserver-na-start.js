const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const axios = require("axios");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgoserver-na-start")
    .setDescription("[Admin] Send a START command to a EU CS:GO server")
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
    const server = options.getString("server");

    let serverID;
    let serverName = server;
    switch (serverName) {
      case "csgo-fkz-1":
        serverName = "CS:GO FKZ 1 - Whitelist 128t";
        serverID = process.env.NA_CSGO_WL_SERVERID;
        break;
      case "csgo-fkz-2":
        serverName = "CS:GO FKZ 2 - Public 64t";
        serverID = process.env.NA_CSGO_64_SERVERID;
        break;
      default:
        serverName = "Unknown";
    }

    if (
      interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
      interaction.member.roles.cache.has(`${process.env.CSGO_MANAGER_ROLE}`)
    ) {
      try {
        await interaction.reply({
          content: `Starting: ${serverName}`,
          ephemeral: true,
        });
        const response = await axios.post(
          `https://dathost.net/api/0.1/game-servers/${serverID}/start`,
          {},
          {
            auth: {
              username: process.env.DATHOST_USERNAME,
              password: process.env.DATHOST_API_KEY,
            },
          }
        );
        if (response.status === 200) {
          await interaction.editReply({
            content: `Started: ${serverName}`,
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
    } else {
      await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }
  },
};

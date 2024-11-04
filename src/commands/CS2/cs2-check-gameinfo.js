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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cs2-check-gameinfo")
    .setDescription(
      "[Admin] Check that metamod is present in the gameinfo file of a FKZ CS2 server"
    )
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to check")
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
      .setTitle("FKZ CS2 Check Gameinfo")
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
        id: 2,
      },
      "cs2-fkz-10": {
        name: "CS2 AU - FKZ - Public - KZ",
        user: null,
        id: 2,
      },
      "cs2-fkz-11": {
        name: "CS2 SA - FKZ - Public - KZ",
        user: null,
        id: 2,
      },
      "cs2-fkz-12": {
        name: "CS2 ZA - FKZ - Public - KZ",
        user: null,
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

    const commandLocal = `sudo -iu cs2-${user} /home/cs2-${user}/gameinfo.sh`;
    const commandApi = `curl -headers "Accept: application/json, Authorization: Bearer ${key}" --request POST --data '{"user": "${user}", "game": "cs2", "command": "gameinfo.sh"}' ${url}`;

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
      embed.setDescription(`Checking gameinfo on: ${name}`);
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      if (id === null) {
        exec(commandLocal, async (error, stdout, stderr) => {
          if (error) {
            console.log(error);
            embed.setDescription(`There was an error checking ${name}.`);
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          } else {
            embed.setDescription(`Checked gameinfo on: ${name}.`);
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
            embed.setDescription(`There was an error checking ${name}.`);
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          } else {
            embed.setDescription(`Checked gameinfo on: ${name}.`); // we just assume it works for now.
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        });
      } else {
        // can't run scripts on dathost servers
        embed.setDescription(`This command is not available for: ${name}.`);
        return await interaction.editReply({
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

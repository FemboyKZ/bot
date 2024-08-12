const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

const username = process.env.DATHOST_USERNAME;
const password = process.env.DATHOST_PASSWORD;

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

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("FKZ CS2 Check Gameinfo")
      .setFooter({ text: `FKZ` });

    const server = {
      "cs2-fkz-1": {
        name: "CS2 EU - FKZ 1 - Whitelist",
        user: "cs2-fkz-1",
        id: null,
      },
      "cs2-fkz-2": {
        name: "CS2 EU - FKZ 2 - Public KZ",
        user: "cs2-fkz-2",
        id: null,
      },
      "cs2-fkz-3": {
        name: "CS2 EU - FKZ 3 - Public MV",
        user: "cs2-fkz-3",
        id: null,
      },
      "cs2-fkz-4": {
        name: "CS2 EU - FKZ 4 - Public HNS",
        user: "cs2-fkz-4",
        id: null,
      },
      "cs2-fkz-5": {
        name: "CS2 EU - FKZ 5 - Testing",
        user: "cs2-fkz-5",
        id: null,
      },
      "cs2-fkz-6": {
        name: "CS2 NA - FKZ 1 - Public KZ",
        user: "cs2-fkz-6",
        id: process.env.NA_CS2_KZ_SERVERID,
      },
      "cs2-fkz-7": {
        name: "CS2 NA - FKZ 1 - Public MV",
        user: "cs2-fkz-7",
        id: process.env.NA_CS2_MV_SERVERID,
      },
      "cs2-fkz-8": {
        name: "CS2 NA - FKZ 1 - Public HNS",
        user: "cs2-fkz-8",
        id: process.env.NA_CS2_HNS_SERVERID,
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

    if (id !== null) {
      embed.setDescription(`Cannot check gameinfo for: ${name}.`);
      return await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    const statusUrl = `https://dathost.net/api/0.1/game-servers/${id}`;
    const statusCommand = `curl -u "${username}:${password}" --request GET \--url ${statusUrl} \--header 'accept: application/json'`;
    // I know curl is not the best way to do this, but it works (node-fetch and axios didn't)
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
      !interaction.member.roles.cache.has(process.env.CS2_MANAGER_ROLE)
    ) {
      embed.setDescription("You don't have perms to use this command.");
      return await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    try {
      embed.setDescription(`Checking gameinfo for: ${name}.`);
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      exec(
        `sudo -iu ${user} /home/${user}/gameinfo.sh`,
        async (error, stdout, stderr) => {
          if (error) console.log(error);
          //if (stderr) console.log(stderr);
          //if (stdout) console.log(stdout);
          await wait(3000);
          if (stdout.includes("Line already exists")) {
            embed.setDescription(
              `Metamod is already defined in gameinfo for ${name}.`
            );
            return await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          } else if (stdout.includes("Line added")) {
            embed.setDescription(`Defined metamod in gameinfo for ${name}.`);
            return await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          } else {
            embed.setDescription(
              `Failed to define metamod in gameinfo for ${name}.`
            );
            return await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        }
      );
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

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
    .setName("cs2-restart")
    .setDescription("[Admin] Send a RESTART command to a FKZ CS2 server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to restart")
        .setRequired(true)
        .addChoices(
          { name: "CS2 EU - FKZ 1 - Whitelist", value: "cs2-fkz-1" },
          { name: "CS2 EU - FKZ 2 - Public KZ", value: "cs2-fkz-2" },
          { name: "CS2 EU - FKZ 3 - Public MV", value: "cs2-fkz-3" },
          { name: "CS2 EU - FKZ 4 - Testing", value: "cs2-fkz-4" }
          /*
          { name: "CS2 NA - FKZ 1 - Public KZ", value: "cs2-fkz-5" },
          { name: "CS2 NA - FKZ 2 - Public MV", value: "cs2-fkz-6" }
          */
        )
    ),

  async execute(interaction) {
    const { options } = interaction;
    const servers = options.getString("server");

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("FKZ CS2 Restart")
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
        name: "CS2 EU - FKZ 4 - Testing",
        user: "cs2-fkz-5",
        id: null,
      },
      "cs2-fkz-5": {
        name: "CS2 NA - FKZ 1 - Public KZ",
        user: "cs2-fkz-5",
        id: process.env.NA_CS2_KZ_SERVERID,
      },
      "cs2-fkz-6": {
        name: "CS2 NA - FKZ 1 - Public MV",
        user: "cs2-fkz-6",
        id: process.env.NA_CS2_MV_SERVERID,
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

    const statusUrl = `https://dathost.net/api/0.1/game-servers/${id}`;
    const statusCommand = `curl -u "${username}:${password}" --request GET \--url ${statusUrl} \--header 'accept: application/json'`;
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
      embed.setDescription(`Restarting: ${name}`);
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      if (id !== null) {
        exec(
          `curl -u "${username}:${password}" --request POST \--url https://dathost.net/api/0.1/game-servers/${id}/stop`,
          async (error, stdout, stderr) => {
            if (error) console.log(error);
            //if (stderr) console.log(stderr);
            //if (stdout) console.log(stdout);
          }
        );
        await wait(3000);
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
            embed.setDescription(`Restarted: ${name}`);
            return await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          } else {
            embed.setDescription(`(Probably) Restarted: ${name}`);
            return await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        });
      } else {
        exec(
          `sudo -iu ${user} /home/${user}/cs2server restart`,
          async (error, stdout, stderr) => {
            if (error) console.log(error);
            //if (stderr) console.log(stderr);
            //if (stdout) console.log(stdout);
          }
        );
        await wait(3000);
        embed.setDescription(`Restarted: ${name}`);
        return await interaction.editReply({
          embeds: [embed],
          ephemeral: true,
        });
      }
    } catch (error) {
      await interaction.reply({
        content: `Error: ${error}`,
        ephemeral: true,
      });
    }
  },
};

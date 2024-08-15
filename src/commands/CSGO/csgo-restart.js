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
        user: "csgo-fkz-1",
        id: null,
      },
      "csgo-fkz-2": {
        name: "CS:GO EU - FKZ 2 - Public 64t",
        user: "csgo-fkz-2",
        id: null,
      },
      "csgo-fkz-3": {
        name: "CS:GO EU - FKZ 3 - Public Nuke",
        user: "csgo-fkz-3",
        id: null,
      },
      "csgo-fkz-4": {
        name: "CS:GO NA - FKZ 1 - Whitelist 128t",
        user: "csgo-fkz-4",
        id: process.env.NA_CSGO_WL_SERVERID,
      },
      "csgo-fkz-5": {
        name: "CS:GO NA - FKZ 2 - Public 64t",
        user: "csgo-fkz-5",
        id: process.env.NA_CSGO_64_SERVERID,
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
      !interaction.member.roles.cache.has(`${process.env.CSGO_MANAGER_ROLE}`)
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
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          } else {
            embed.setDescription(`(Probably) Restarted: ${name}`);
            return await interaction.editReply({
              embed: embed,
              ephemeral: true,
            });
          }
        });
      } else {
        exec(
          `sudo -iu ${user} /home/${user}/csgoserver restart`,
          async (error, stdout, stderr) => {
            if (error) console.log(error);
            //if (stderr) console.log(stderr);
            //if (stdout) console.log(stdout);
          }
        );
        await wait(3000);
        embed.setDescription(`Restarted: ${name}`);
        await interaction.editReply({
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

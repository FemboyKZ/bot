const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { exec } = require("child_process");
const axios = require("axios");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

const key = process.env.API_KEY;
const port = process.env.PORT || 8080;
const apiUrl = new URL(process.env.API_URL);
const url = `${apiUrl.origin}:${port}${apiUrl.pathname}`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cs2-stop")
    .setDescription("[Admin] Send a STOP command to a FKZ CS2 server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to stop")
        .setRequired(true)
        .addChoices(
          { name: "CS2 EU - FKZ 1 - Whitelist", value: "cs2-fkz-1" },
          { name: "CS2 EU - FKZ 2 - Public KZ", value: "cs2-fkz-2" },
          { name: "CS2 EU - FKZ 3 - Public MV", value: "cs2-fkz-3" },
          { name: "CS2 EU - FKZ 4 - Testing", value: "cs2-fkz-4" },
          { name: "CS2 NA - FKZ 1 - Public KZ", value: "cs2-fkz-5" },
          { name: "CS2 NA - FKZ 2 - Public MV", value: "cs2-fkz-6" }
        )
    ),

  async execute(interaction) {
    const { options } = interaction;
    const servers = options.getString("server");

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("FKZ CS2 Stop")
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
        id: 1,
      },
      "cs2-fkz-6": {
        name: "CS2 NA - FKZ 1 - Public MV",
        user: "cs2-fkz-6",
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
    const command = `sudo -iu ${user} /home/${user}/cs2server stop`;

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
      embed.setDescription(`Stopping: ${name}`);
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      if (id === null) {
        exec(command, async (error, stdout, stderr) => {
          if (error) console.log(error);
        });
        await wait(3000);
        embed.setDescription(`Stopped: ${name}`);
        return await interaction.editReply({
          embeds: [embed],
          ephemeral: true,
        });
      } else {
        if (!url || !key) {
          embed.setDescription("API url and/or key missing.");
          return await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
          });
        }
        const response = await axios.post(
          url,
          {
            command: command,
          },
          {
            headers: {
              authorization: `Bearer ${key}`,
            },
          }
        );
        await wait(3000);
        if (response.data.status === 200) {
          embed.setDescription(`Stopped: ${name}`);
          return await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
          });
        } else {
          console.log(response.status, response.data);
          embed.setDescription(`Something went wrong while stopping: ${name}`);
          return await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
          });
        }
      }
    } catch (error) {
      await interaction.reply({
        content: `Error: ${error}`,
        ephemeral: true,
      });
    }
  },
};

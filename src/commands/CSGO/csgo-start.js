const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { exec } = require("child_process");
const axios = require("axios");
require("dotenv").config();

const key = process.env.API_KEY;
const port = process.env.API_PORT || 8080;
const apiUrl = new URL(process.env.API_URL);
const url = `${apiUrl.origin}:${port}${apiUrl.pathname}`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgo-start")
    .setDescription("[Admin] Send a START command to a FKZ CS:GO server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to start")
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
      .setTitle("FKZ CS:GO Start")
      .setFooter({ text: `FKZ` });

    const server = {
      "csgo-fkz-1": {
        name: "CS:GO EU - FKZ 1 - Whitelist 128t",
        user: "fkz-1",
        id: null,
      },
      "csgo-fkz-2": {
        name: "CS:GO EU - FKZ 2 - Public 64t",
        user: "fkz-2",
        id: null,
      },
      "csgo-fkz-3": {
        name: "CS:GO EU - FKZ 3 - Public Nuke",
        user: "fkz-3",
        id: null,
      },
      "csgo-fkz-4": {
        name: "CS:GO NA - FKZ 1 - Whitelist 128t",
        user: "fkz-1",
        id: 1,
      },
      "csgo-fkz-5": {
        name: "CS:GO NA - FKZ 2 - Public 64t",
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
    const command = `sudo -iu csgo-${user} /home/csgo-${user}/csgoserver start`;

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
      embed.setDescription(`Starting: ${name}`);
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      if (id === null) {
        exec(command, async (error, stdout, stderr) => {
          if (error) console.log(error);
        });
        embed.setDescription(`Started: ${name}`);
        await interaction.editReply({
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
            user: user,
            game: "csgo",
            command: "start",
          },
          {
            headers: {
              authorization: `Bearer ${key}`,
            },
          }
        );
        if (response.data.status === 200) {
          embed.setDescription(`Started: ${name}`);
          return await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
          });
        } else {
          console.log(response.status, response.data);
          embed.setDescription(`Something went wrong while starting: ${name}`);
          return await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
          });
        }
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

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { exec } = require("child_process");
const axios = require("axios");
const https = require("https");
require("dotenv").config();

const key = process.env.API_KEY;
const port = process.env.API_PORT || 8080;
const apiUrl = new URL(process.env.API_URL);
const url = `${apiUrl.origin}:${port}${apiUrl.pathname}`;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  secureProtocol: "TLSv1_2_method",
});

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
      .setTitle("FKZ CS2 Check Gameinfo")
      .setFooter({ text: `FKZ` });

    const server = {
      "cs2-fkz-1": {
        name: "CS2 EU - FKZ 1 - Whitelist",
        user: "fkz-1",
        id: null,
      },
      "cs2-fkz-2": {
        name: "CS2 EU - FKZ 2 - Public KZ",
        user: "fkz-2",
        id: null,
      },
      "cs2-fkz-3": {
        name: "CS2 EU - FKZ 3 - Public MV",
        user: "fkz-3",
        id: null,
      },
      "cs2-fkz-4": {
        name: "CS2 EU - FKZ 4 - Testing",
        user: "fkz-5",
        id: null,
      },
      "cs2-fkz-5": {
        name: "CS2 NA - FKZ 1 - Public KZ",
        user: "fkz-1",
        id: 1,
      },
      "cs2-fkz-6": {
        name: "CS2 NA - FKZ 1 - Public MV",
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
    const command = `sudo -iu cs2-${user} /home/cs2-${user}/gameinfo.sh`;

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
      embed.setDescription(`Checking gameinfo for: ${name}.`);
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });

      const handleOutput = async (output) => {
        if (output.includes("Line already exists")) {
          embed.setDescription(
            `Metamod is already defined in gameinfo for ${name}.`
          );
        } else if (output.includes("Line added")) {
          embed.setDescription(`Defined metamod in gameinfo for ${name}.`);
        } else {
          embed.setDescription(
            `Failed to define metamod in gameinfo for ${name}.`
          );
        }
        await interaction.editReply({
          embeds: [embed],
          ephemeral: true,
        });
      };

      const executeCommand = async () => {
        if (id === null) {
          exec(command, async (error, stdout, stderr) => {
            if (error) {
              console.log(error);
              embed.setDescription(`Error: ${stderr}`);
              return await interaction.editReply({
                embeds: [embed],
                ephemeral: true,
              });
            }
            await handleOutput(stdout);
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
              game: "cs2",
              command: "gameinfo.sh",
            },
            {
              headers: {
                authorization: `Bearer ${key}`,
              },
              httpsAgent,
            }
          );
          if (response.status === 200) {
            await handleOutput(response.data);
          } else {
            console.log(response.status, response.data);
            embed.setDescription(
              `Failed to define metamod in gameinfo for ${name}.`
            );
            await interaction.editReply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        }
      };

      await executeCommand();
    } catch (error) {
      console.error(error);
      embed.setDescription(`Error: ${error.message}`);
      await interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};

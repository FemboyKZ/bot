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
    .setName("cscl-restart")
    .setDescription(
      "[Admin] Send a RESTART command to a FKZ ClassicCounter server"
    )
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to restart")
        .setRequired(true)
        .addChoices(
          { name: "CS:CL EU FKZ 1 - VNL KZ 128t", value: "cscl-fkz-1" },
          { name: "CS:CL EU FKZ 2 - VNL KZ 64t", value: "cscl-fkz-2" },
          { name: "CS:CL EU FKZ 3 - KZTimer 128t", value: "cscl-fkz-3" },
          { name: "CS:CL NA FKZ 1 - VNL KZ 128t", value: "cscl-fkz-4" },
          { name: "CS:CL NA FKZ 2 - VNL KZ 64t", value: "cscl-fkz-5" }
        )
    ),

  async execute(interaction) {
    const { options } = interaction;
    const servers = options.getString("server");

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setTitle("FKZ ClassicCounter Restart")
      .setFooter({ text: `FKZ` });

    const server = {
      "cscl-fkz-1": {
        name: "CS:CL EU - FKZ 1 - VNL KZ 128t",
        user: "cscl-fkz-1",
        id: null,
      },
      "cscl-fkz-2": {
        name: "CS:CL EU - FKZ 2 - VNL KZ 64t",
        user: "cscl-fkz-2",
        id: null,
      },
      "cscl-fkz-3": {
        name: "CS:CL EU - FKZ 3 - KZTimer 128t",
        user: "cscl-fkz-3",
        id: null,
      },
      "cscl-fkz-4": {
        name: "CS:CL NA - FKZ 1 - VNL KZ 128t",
        user: "cscl-fkz-1",
        id: 1,
      },
      "cscl-fkz-5": {
        name: "CS:CL NA - FKZ 2 - VNL KZ 64t",
        user: "cscl-fkz-2",
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
    const command = `sudo -iu ${user} /home/${user}/csgoserver restart`;

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) &&
      !interaction.member.roles.cache.has(`${process.env.CSCL_MANAGER_ROLE}`)
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
      if (id === null) {
        exec(command, async (error, stdout, stderr) => {
          if (error) console.log(error);
        });
        await wait(3000);
        embed.setDescription(`Restarted: ${name}`);
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
          embed.setDescription(`Restarted: ${name}`);
          return await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
          });
        } else {
          console.log(response.status, response.data);
          embed.setDescription(
            `Something went wrong while restarting: ${name}`
          );
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

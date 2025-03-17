const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

const user = "csgo-pizan-1";
const name = "sportsmenskaya razdevalka";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgo-stop")
    .setDescription(`Send a STOP command to ${name}`),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
      !interaction.member.roles.cache.has(`${process.env.BOT_MANAGER_ROLE}`)
    ) {
      return await interaction.reply({
        content: "You don't have the perms to use this command.",
        ephemeral: true,
      });
    }

    try {
      await interaction.reply({
        content: `Stopping: \`${name}\``,
        ephemeral: true,
      });
      exec(
        `sudo -iu ${user} /home/${user}/csgoserver stop`,
        async (error, stdout, stderr) => {
          if (error) console.log(error);
          //if (stderr) console.log(stderr);
          //if (stdout) console.log(stdout);
        }
      );
      await wait(3000);
      return await interaction.editReply({
        content: `Stopped: \`${name}\``,
        ephemeral: true,
      });
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

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgosalad-restart")
    .setDescription("[Salad] Send a restart command to Fruity CS:GO server"),

  async execute(interaction) {
    if (
      interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
      interaction.member.roles.cache.has(`${process.env.SALAD_MANAGER_ROLE}`)
    ) {
      try {
        await interaction.reply({
          content: `Restarting: Fruity CS:GO`,
          ephemeral: true,
        });
        exec(
          "sudo -iu csgo-salad-1 /home/csgo-salad-1/csgoserver restart",
          async (error, stdout, stderr) => {
            await wait(5000);
            if (!interaction) return;
            if (error) {
              return await interaction.editReply({
                content: `Error: ${error.message}`,
                ephemeral: true,
              });
            }
            if (stderr) {
              return await interaction.editReply({
                content: `Stderr: ${stderr}`,
                ephemeral: true,
              });
            }
            return await interaction.editReply({
              content: `Restarted: Fruity CS:GO`,
              ephemeral: true,
            });
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
    } else {
      await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }
  },
};

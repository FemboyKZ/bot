const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cs2server-update-all")
    .setDescription("[Admin] Send a update command to all 5 FKZ CS:2 servers"),
  async execute(interaction) {
    const servers = [
      "cs2-fkz-1",
      "cs2-fkz-2",
      "cs2-fkz-3",
      "cs2-fkz-4",
      "cs2-fkz-5",
    ];
    if (
      interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
      interaction.member.roles.cache.has("1250268777678110741")
    ) {
      try {
        for (let i = 0; i < servers.length; i++) {
          const server = servers[i];
          await interaction.reply({
            content: `Updating: ${server}`,
            ephemeral: true,
          });
          exec(
            `sudo -iu ${server} /home/${server}/cs2server update`,
            async (error, stdout, stderr) => {
              await wait(20000);
              if (!interaction) return;
              if (error || stderr) {
                return await interaction.editReply({
                  content: `Error: ${error.message || stderr}`,
                  ephemeral: true,
                });
              }
              return await interaction.editReply({
                content: `Updated: ${server}`,
                ephemeral: true,
              });
            }
          );
        }
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

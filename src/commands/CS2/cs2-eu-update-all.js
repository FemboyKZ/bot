const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const wait = require("timers/promises").setTimeout;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cs2-eu-update-all")
    .setDescription("[Admin] Send a UPDATE command to all 5 FKZ CS:2 servers"),
  async execute(interaction) {
    const servers = [
      "cs2-fkz-1",
      "cs2-fkz-2",
      "cs2-fkz-3",
      "cs2-fkz-4",
      "cs2-fkz-5",
    ];
    const serverNames = [
      "CS:2 FKZ 1 - Whitelist",
      "CS:2 FKZ 2 - Public KZ",
      "CS:2 FKZ 3 - Public MV",
      "CS:2 FKZ 4 - Public HNS",
      "CS:2 FKZ 5 - Testing",
    ];
    if (
      interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
      interaction.member.roles.cache.has(`${process.env.CS2_MANAGER_ROLE}`)
    ) {
      try {
        for (let i = 0; i < servers.length; i++) {
          const server = servers[i];
          const serverName = serverNames[i];
          if (interaction && i > 0) {
            await interaction.deferReply({ ephemeral: true });
          }

          if (interaction && i === 1) {
            await interaction.reply({
              content: `Updating: ${serverName}`,
              ephemeral: true,
            });
          } else if (interaction) {
            await interaction.editReply({
              content: `Updating: ${serverName}`,
              ephemeral: true,
            });
          }
          exec(
            `sudo -iu ${server} /home/${server}/cs2server update`,
            async (error, stdout, stderr) => {
              await wait(15000);
              if (!interaction) return;
              if (error || stderr) {
                return await interaction.editReply({
                  content: `Error: ${error.message || stderr}`,
                  ephemeral: true,
                });
              }
              if (i > 0) {
                return await interaction.editReply({
                  content: `Updated: ${serverName}`,
                  ephemeral: true,
                });
              }
            }
          );
        }
        await wait(5000);
        if (interaction) {
          await interaction.editReply({
            content: "All 5 servers have been updated.",
            ephemeral: true,
          });
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

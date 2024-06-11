const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { exec } = require("child_process");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgoserver-restart")
    .setDescription("[Admin] Send a restart command to a CS:GO server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to restart")
        .setRequired(true)
        .addChoices(
          { name: "CS:GO FKZ 1 - Whitelist 128t", value: "csgo-fkz-1" },
          { name: "CS:GO FKZ 2 - Public 64t", value: "csgo-fkz-2" },
          { name: "CS:GO FKZ 3 - Public Nuke", value: "csgo-fkz-3" }
        )
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { options } = interaction;
    const server = options.getString("server");

    const command = `sudo -iu ${server} "/home/${server}/csgoserver restart"`;

    try {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          return interaction.reply({
            content: `Error: ${error.message}`,
            ephemeral: true,
          });
        }
        if (stderr) {
          return interaction.reply({
            content: `Stderr: ${stderr}`,
            ephemeral: true,
          });
        }
        return interaction.reply({
          content: `Output: ${stdout}`,
          ephemeral: true,
        });
      });
    } catch (error) {
      interaction.reply({ content: `Error: ${error}`, ephemeral: true });
    }
  },
};

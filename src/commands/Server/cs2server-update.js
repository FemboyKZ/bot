const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { exec } = require("child_process");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cs2server-update")
    .setDescription("[Admin] Send a update command to a CS:2 server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to uptdate")
        .setRequired(true)
        .addChoices(
          { name: "CS:2 FKZ 1 - Whitelist", value: "cs2-fkz-1" },
          { name: "CS:2 FKZ 2 - Public KZ", value: "cs2-fkz-2" },
          { name: "CS:2 FKZ 3 - Public MV", value: "cs2-fkz-3" },
          { name: "CS:2 FKZ 4 - Public HNS", value: "cs2-fkz-4" }
        )
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }

    const { options } = interaction;
    const server = options.getString("server");

    const command = `/home/${server}/cs2server update`;

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

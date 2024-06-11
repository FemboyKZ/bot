const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { exec } = require("child_process");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csclserver-start")
    .setDescription("[Admin] Send a start command to a ClassicCounter server")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Which server do you want to start")
        .setRequired(true)
        .addChoices(
          { name: "CS:CL FKZ 1 - VNL 128t", value: "cscl-fkz-1" },
          { name: "CS:CL FKZ 2 - VNL 64t", value: "cscl-fkz-2" }
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

    const command = `sudo -iu ${server} "/home/${server}/csgoserver start"`;

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

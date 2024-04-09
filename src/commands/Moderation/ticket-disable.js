const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const ticketSchema = require("../../Schemas.js/ticketSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-disable")
    .setDescription("[Admin] Disable the tickets system"),
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

    ticketSchema.deleteMany(
      { Guild: interaction.guild.id },
      async (err, data) => {
        await interaction.reply({
          content: `The tickets system has been disabled`,
          ephemeral: true,
        });
      }
    );
  },
};

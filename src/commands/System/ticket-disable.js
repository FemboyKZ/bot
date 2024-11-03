const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const schema = require("../../Schemas/base-system.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-disable")
    .setDescription("[Admin] Disable the tickets system"),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }

    const data = await schema.findOne({
      Guild: interaction.guild.id,
      Type: "tickets",
    });

    try {
      if (!data) {
        return await interaction.reply({
          content: "The tickets system is already disabled.",
          ephemeral: true,
        });
      }
      await schema.deleteMany({ Guild: interaction.guild.id, Type: "tickets" });
      await interaction.reply({
        content: `The tickets system has been disabled.`,
        ephemeral: true,
      });
    } catch (err) {
      console.error("Error executing command:", err);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};

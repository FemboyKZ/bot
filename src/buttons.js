const { PermissionsBitField, Events } = require("discord.js");
const { client } = require("./index.js");

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  if (
    !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
  ) {
    return await interaction.reply({
      content: `You don't have perms to use this command.`,
      ephemeral: true,
    });
  }

  if (interaction.customId === "ticket-close") {
    await interaction.reply({
      content: `Ticket closed.`,
      ephemeral: true,
    });
    await interaction.message.delete();
  }
});

import { Interaction } from "discord.js";

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction || !interaction.isCommand()) {
      return;
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error("Error executing command:", error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};

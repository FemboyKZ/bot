const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction || !client) {
      return;
    }

    /*
    if (interaction.isAnySelectMenu()) {
    }

    if (interaction.isAutoComplete()) {
    }

    if (interaction.isButton()) {
    }

    if (interaction.isChannelSelectMenu()) {
    }

    if (interaction.isChatInputCommand()) {
    }
    */

    if (interaction.isCommand()) {
      const command = await client.commands.get(interaction.commandName);
      if (!command) {
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error("Error executing command:", error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }
    }

    /*
    if (interaction.isContextMenuCommand()) {
    }

    if (interaction.isFromMessage()) {
    }

    if (interaction.isMentionableSelectMenu()) {
    }
    
    if (interaction.isMessageComponent()) {
    }

    if (interaction.isMessageContextMenuCommand()) {
    }

    if (interaction.isModalSubmit()) {
    }

    if (interaction.isRepliable()) {
    }

    if (interaction.isRoleSelectMenu()) {
    }

    if (interaction.isStringSelectMenu()) {
    }

    if (interaction.isUserContextMenuCommand()) {
    }

    if (interaction.isUserSelectMenu()) {
    }
    */
  },
};

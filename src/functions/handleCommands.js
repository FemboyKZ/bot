const fs = require("fs");
const path = require("path");
const process = require("node:process");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require("dotenv").config();

module.exports = (client) => {
  client.loadCommands = async (commandsPath) => {
    client.commandArray = [];
    client.commands = new Map();

    const loadCommands = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          loadCommands(fullPath);
        } else if (file.endsWith(".js")) {
          const command = require(fullPath);

          if (!command.data || !command.data.name || !command.data.toJSON) {
            console.error(`Invalid command file`);
            continue;
          }

          client.commands.set(command.data.name, command);
          client.commandArray.push(command.data.toJSON());
          //console.log(`Loaded command: ${command.data.name}`);
        }
      }
    };

    console.log(`Starting to load commands from: ${commandsPath}`);
    loadCommands(commandsPath);
    console.log(
      `Finished loading commands. Total commands: ${client.commandArray.length}`,
    );
  };

  client.registerCommands = async () => {
    if (!process.env.TOKEN) {
      throw new Error("Bot token is not set.");
    }

    if (!client.user?.id) {
      throw new Error("Client user ID not available. Client not ready?");
    }

    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

    try {
      console.log(
        `Refreshing application (/) commands for client ${client.user.id}...`,
      );

      await rest.put(Routes.applicationCommands(client.user.id), {
        body: client.commandArray,
      });

      console.log("Successfully registered application commands.");
    } catch (error) {
      console.error("Error registering commands:", error);
      throw error;
    }
  };
};

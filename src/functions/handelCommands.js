import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { readdirSync } from "fs";
require("dotenv").config();
import { env } from "node:process";

const clientId = process.env.clientID;
const guildId = process.env.guildID;

export default (client) => {
  client.handleCommands = async (commandFolders, path) => {
    client.commandArray = [];
    for (folder of commandFolders) {
      const commandFiles = readdirSync(`${path}/${folder}`).filter((file) =>
        file.endsWith(".js")
      );
      for (const file of commandFiles) {
        const command = require(`../commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
      }
    }

    const rest = new REST({
      version: "9",
    }).setToken(env.token);

    (async () => {
      try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationCommands(clientId), {
          body: client.commandArray,
        });

        console.log("Successfully reloaded application (/) commands.");
      } catch (error) {
        console.error(error);
      }
    })();
  };
};

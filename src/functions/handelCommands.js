import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { readdirSync } from "fs";
require("dotenv").config();
import { env } from "node:process";

const clientId = env.clientID;
const guildId = env.guildID;

export default (client) => {
  client.handleCommands = async (commandFolders, path) => {
    if (!commandFolders || !Array.isArray(commandFolders)) {
      throw new Error("commandFolders is not an array");
    }
    if (!path || typeof path !== "string") {
      throw new Error("path is not a string");
    }
    const rest = new REST({
      version: "9",
    }).setToken(env.token);
    if (!rest) {
      throw new Error("REST instance could not be created");
    }
    if (!Routes || !Routes.applicationCommands) {
      throw new Error("Routes or Routes.applicationCommands is not available");
    }

    for (const folder of commandFolders) {
      if (typeof folder !== "string") {
        throw new Error("folder is not a string");
      }
      const commandFiles = readdirSync(`${path}/${folder}`).filter((file) =>
        file.endsWith(".js")
      );
      if (
        !commandFiles ||
        !Array.isArray(commandFiles) ||
        !commandFiles.length
      ) {
        console.warn(`No command files found in ${folder}`);
        continue;
      }
      for (const file of commandFiles) {
        const command = require(`../commands/${folder}/${file}`);
        if (!command || !command.data) {
          console.warn(`Command in file ${file} is not valid`);
          continue;
        }
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
      }
    }

    try {
      console.log("Started refreshing application (/) commands.");
      await rest.put(Routes.applicationCommands(clientId), {
        body: client.commandArray,
      });

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  };
};

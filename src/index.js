const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const process = require("node:process");

require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.ThreadMember,
    Partials.User,
  ],
  presence: { status: "online", game: { name: "privet" } },
});

exports.client = client;

client.commands = new Collection();

require(path.join(__dirname, "handleConsole.js"));

client.gracefulShutdown = async function () {
  return process.exit(0);
};

if (!process.env.TOKEN) {
  console.error("Bot token is not set in the environment variables.");
  client.gracefulShutdown().catch(console.error);
}

const functionsPath = path.join(__dirname, "functions");
const functions = fs
  .readdirSync(functionsPath)
  .filter((file) => file.endsWith(".js"));

const eventsPath = path.join(__dirname, "events");
const clientEventsPath = path.join(eventsPath, "client");
const processEventsPath = path.join(eventsPath, "process");

const commandsPath = path.join(__dirname, "commands");

(async () => {
  try {
    await client.login(process.env.TOKEN);
    let file;
    for (file of functions) {
      require(`${functionsPath}/${file}`)(client);
    }
    await client.handleEvents(clientEventsPath);
    await client.handleProcessEvents(processEventsPath);
    await client.handleCommands(commandsPath);
  } catch (error) {
    console.error("Error starting the bot:", error);
  }
})();

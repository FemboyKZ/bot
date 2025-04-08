const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const process = require("node:process");

require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessagePolls,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessagePolls,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
  presence: { status: "online", game: { name: ":3" } },
});
exports.client = client;

client.commands = new Collection();
//client.cooldowns = new Collection();
client.invites = new Collection();

const utilsPath = path.join(__dirname, "utils");
require(path.join(utilsPath, "handleConsole.js"));
require(path.join(utilsPath, "syncGuildData.js"))(client);

client.gracefulShutdown = async function () {
  try {
    await mongoose.connection.close();
    console.log("Database connection closed successfully.");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }

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
const restEventsPath = path.join(eventsPath, "rest");
const mongoEventsPath = path.join(eventsPath, "mongo");

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
    await client.handleRestEvents(restEventsPath);
    await client.handleMongoEvents(mongoEventsPath);
    await client.handleCommands(commandsPath);
  } catch (error) {
    console.error("Error starting the bot:", error);
  }
})();

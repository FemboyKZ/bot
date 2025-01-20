const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

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
});
exports.client = client;

client.commands = new Collection();
client.cooldowns = new Collection();
client.invites = new Collection();

const process = require("node:process");
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

require("dotenv").config();

//require("./guild-scraper.js");

const functionsPath = path.join(__dirname, "functions");
const eventsPath = path.join(__dirname, "events");
const commandsPath = path.join(__dirname, "commands");

const functions = fs
  .readdirSync(functionsPath)
  .filter((file) => file.endsWith(".js"));
const commandFolders = fs.readdirSync(commandsPath);

(async () => {
  for (file of functions) {
    require(`${functionsPath}/${file}`)(client);
  }
  client.handleEvents(eventsPath);
  client.handleCommands(commandFolders, commandsPath);
  client.login(process.env.TOKEN);
})();

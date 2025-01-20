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

client.on("error", (error) => {
  console.error("Error occurred:", error);
});

require("dotenv").config();

client.on("disconnect", () => {
  console.log("Disconnected from Discord API");
  const retry = (fn, retries = 3, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      fn()
        .then(resolve)
        .catch((error) => {
          if (retries > 0) {
            setTimeout(() => {
              retry(fn, retries - 1, timeout)
                .then(resolve)
                .catch(reject);
            }, timeout);
          } else {
            reject(error);
          }
        });
    });
  };
  console.log("Attempting to reconnect...");
  retry(() => client.login(process.env.TOKEN))
    .then(() => console.log("Logged in successfully"))
    .catch((error) => console.error("Failed to log in:", error));
});

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

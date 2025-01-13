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

function logError(error) {
  const filepath = path.join(__dirname, "error.log");
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}]: ${error.stack || error}\n`;

  fs.appendFile(filepath, message, (err) => {
    if (err) {
      console.error("Failed to write to log file:", err);
    }
  });
}

const process = require("node:process");
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
  logError("Unhandled Rejection at:", promise, "reason:", reason);
});

client.on("error", (error) => {
  console.error("Error occurred:", error);
  logError("Error occurred:", error);
});

require("dotenv").config();

client.on("disconnect", () => {
  console.log("Disconnected from Discord API");
  logError("Disconnected from Discord API");
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
  logError("Attempting to reconnect...");
  retry(() => client.login(process.env.TOKEN))
    .then(
      () => console.log("Logged in successfully"),
      logError("Logged in successfully")
    )
    .catch(
      (error) => console.error("Failed to log in:", error),
      logError("Failed to log in:", error)
    );
});

require("./anti-link.js");
require("./anti-spam.js");
require("./auto-roles.js");
require("./bot-guilds.js");
require("./guild-scraper.js");
require("./reaction-roles.js");
require("./whitelist-response.js");

require("./logger/automod-rules.js");
require("./logger/bans.js");
require("./logger/channels.js");
require("./logger/emojis.js");
require("./logger/invites.js");
require("./logger/members.js");
require("./logger/messages.js");
require("./logger/roles.js");
require("./logger/stickers.js");
require("./logger/threads.js");

const functions = fs
  .readdirSync("./src/functions")
  .filter((file) => file.endsWith(".js"));
const eventFiles = fs
  .readdirSync("./src/events")
  .filter((file) => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
  for (file of functions) {
    require(`./functions/${file}`)(client);
  }
  client.handleEvents(eventFiles, "./src/events");
  client.handleCommands(commandFolders, "./src/commands");
  client.login(process.env.TOKEN);
})();

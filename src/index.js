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

//const Session = require("./schemas/session.js");

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
  presence: { status: "online" },
});
exports.client = client;

client.commands = new Collection();
//client.cooldowns = new Collection();
client.invites = new Collection();

require(path.join(__dirname, "handleConsole.js"));
require(path.join(__dirname, "syncGuildData.js"))(client);

/*
client.loadSessionData = async (sessionId) => {
  try {
    const session = await Session.findOne({ sessionId: sessionId });
    if (session) {
      console.log("Session data loaded.");
    } else {
      console.warn("No session data found. Starting fresh.");
    }
    return session || { sessionId: null, seq: null };
  } catch (error) {
    console.error("Error loading session data:", error);
    return { sessionId: null, seq: null };
  }
};

client.sessionData = await loadSessionData();

client.saveSessionData = async (sessionId, data) => {
  try {
    const session = await Session.findOneAndUpdate(
      { sessionId: sessionId },
      { data: data, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    console.log("Session data saved.");
    return session;
  } catch (error) {
    console.error("Error saving session data:", error);
  }
};
*/

client.gracefulShutdown = async function () {
  /*
  try {
    await client.saveSessionData(
      client.sessionData.sessionId,
      client.sessionData
    );
  } catch (error) {
    console.error("Error saving session data during shutdown:", error);
  }
  */

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

//require("./guild-scraper.js");

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
  /* eslint-disable no-undef */
  for (file of functions) {
    require(`${functionsPath}/${file}`)(client);
  }
  /* eslint-enable no-undef */
  client.handleEvents(clientEventsPath);
  client.handleProcessEvents(processEventsPath);
  client.handleRestEvents(restEventsPath);
  client.handleMongoEvents(mongoEventsPath);
  client.handleCommands(commandsPath);
  client.login(process.env.TOKEN);
})();

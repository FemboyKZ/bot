const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const fs = require("fs");
const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
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

const process = require("node:process");
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

require("dotenv").config();

require("./auto-roles.js");
require("./anti-link.js");
require("./bot-guilds.js");
require("./modals.js");
require("./tickets.js");
require("./reaction-roles.js");

require("./logger/automod-rules.js");
require("./logger/bans.js");
require("./logger/channels.js");
require("./logger/emojis.js");
require("./logger/interactions.js");
require("./logger/invites.js");
require("./logger/members.js");
require("./logger/messages.js");
require("./logger/roles.js");
require("./logger/stickers.js");
require("./logger/threads.js");
require("./logger/users.js");

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

async () => {
  const guild = await client.guilds.cache.get(`${process.env.GUILD_ID}`); // fkz
  const members = await guild.members.fetch();

  members.forEach(async (member) => {
    const data = await Audit_Log.findOne({
      Guild: guild.id,
      Member: member.id,
    });

    if (data) {
      await data.updateOne({ Member: member.id });
    } else {
      await Audit_Log.create({ Guild: guild.id, Member: member.id });
    }
  });
};

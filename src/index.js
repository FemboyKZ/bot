const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  Collection,
  Events,
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

// anticrash
const process = require("node:process");
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

require("dotenv").config();

require("./anti-link.js");
require("./modals.js");
require("./tickets.js");
require("./bot-guilds.js");

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

// ------------------------------------------------------------------------ guild scraper
async () => {
  const guild = await client.guilds.cache.get(`${process.env.GUILD_ID}`); // fkz
  const members = await guild.members.fetch();

  members.forEach(async (member) => {
    const data = await Audit_Log.findOne({
      Guild: guild.id,
      Member: member.id,
    });

    if (data) {
      // Member already exists in the audit log, update it
      await data.updateOne({ Member: member.id });
    } else {
      // Member does not exist in the audit log, create a new entry
      await Audit_Log.create({ Guild: guild.id, Member: member.id });
    }
  });
};

// ------------------------------------------------------------------------ interaction logger
// doesn't have an enable/disable command and only runs on fkz server cuz lazy lol
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction) return;
  if (!interaction.isChatInputCommand()) return;
  else {
    const channel = await client.channels.cache.get(
      `${process.env.LOGS_CHAT_ID}`
    );
    const server = interaction.guild.name;
    const serverID = interaction.guild.id;
    const user = interaction.user.username;
    const userID = interaction.user.id;
    const iChannel = interaction.channel.name;
    const iChannelID = interaction.channel.id;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("Chat Command Executed.")
      .setTimestamp()
      .addFields([
        {
          name: "Server / ServerID",
          value: `${server} / ${serverID}`,
        },
        {
          name: "Channel / ChannelID",
          value: `${iChannel} / ${iChannelID}`,
        },
        {
          name: "User / UserID",
          value: `${user} / ${userID}`,
        },
        {
          name: "Command & User Input",
          value: `${interaction}`,
        },
      ]);

    await channel.send({ embeds: [embed] });
  }
});

// REACTION ROLES //
const reactions = require("./Schemas/reactionrs");

// reaction add
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (!reaction.message.guildId) return;
  if (user.bot) return;

  let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
  if (!reaction.emoji.id) cID = reaction.emoji.name;

  const data = await reactions.findOne({
    Guild: reaction.message.guildId,
    Message: reaction.message.id,
    Emoji: cID,
  });
  if (!data) return;

  const guild = await client.guilds.cache.get(reaction.message.guildId);
  const member = await guild.members.cache.get(user.id);

  try {
    await member.roles.add(data.Role);
  } catch (e) {
    return;
  }
});
// reaction remove
client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (!reaction.message.guildId) return;
  if (user.bot) return;

  let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
  if (!reaction.emoji.id) cID = reaction.emoji.name;

  const data = await reactions.findOne({
    Guild: reaction.message.guildId,
    Message: reaction.message.id,
    Emoji: cID,
  });
  if (!data) return;

  const guild = await client.guilds.cache.get(reaction.message.guildId);
  const member = await guild.members.cache.get(user.id);

  try {
    await member.roles.remove(data.Role);
  } catch (e) {
    return;
  }
});

// AUTO ROLES //
const autorole = require("./Schemas/autorole");

client.on(Events.GuildMemberAdd, async (member) => {
  const data = await autorole.findOne({ Guild: member.guild.id });
  if (!data || !data.Roles.length) return;
  try {
    for (const roleId of data.Roles) {
      const role = await member.guild.roles.cache.get(roleId);
      if (role) {
        await member.roles.add(role);
      }
    }
  } catch (e) {
    return console.log(e);
  }
});

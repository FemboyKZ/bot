const { Events } = require("discord.js");
const mongoose = require("mongoose");
require("dotenv").config();

const { MONGODB_URI } = process.env;

// mongoose global cfg
mongoose.set("strictQuery", false);
mongoose.set("debug", false);

/**
 * Establishes MongoDB connection
 * @param {Client} client Discord client instance
 */
async function connectToDatabase(client) {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in environment variables");
    return client.gracefulShutdown();
  }

  if (mongoose.connection.readyState !== 0) {
    console.warn(
      `MongoDB connection already in state: ${mongoose.connection.readyState}`,
    );
    return;
  }

  try {
    console.log("Attempting MongoDB connection...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("MongoDB connection established");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    return client.gracefulShutdown();
  }
}

/**
 * Syncs guild data with the database
 * @param {Client} client Discord client instance
 */
async function syncGuildData(client) {
  try {
    console.log("Starting guild data sync...");

    for (const [guildId, guild] of client.guilds.cache) {
      try {
        await client.syncGuildData(guild);
        console.log(`Synced data for: ${guild.name} (${guildId})`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limit buffer
      } catch (guildError) {
        console.error(`Failed to sync ${guild.name} (${guildId}):`, guildError);
      }
    }

    console.log("Guild data sync complete");
  } catch (error) {
    console.error("Global guild sync failed:", error);
  }
}

module.exports = {
  name: Events.ClientReady,
  async execute(client) {
    console.log(`Client ready as ${client.user.tag} (${client.user.id})`);

    await connectToDatabase(client);
    await syncGuildData(client);

    // ClientReady can fire again after a full gateway reconnect;
    if (!client.commandsRegistered) {
      try {
        await client.registerCommands();
        client.commandsRegistered = true;
      } catch (error) {
        console.error("Failed to register commands:", error);
      }
    }
  },
};

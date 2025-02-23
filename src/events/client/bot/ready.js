const { Events, PermissionsBitField, Collection } = require("discord.js");
const mongoose = require("mongoose");
require("dotenv").config();
const mongodbURI = process.env.MONGODB_URI;
const sessionId = process.env.SESSION_ID;

mongoose.set("strictQuery", false);
mongoose.set("debug", false);

module.exports = {
  name: Events.ClientReady,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    if (!mongodbURI) {
      console.warn("Setup mongodbURI in .env");
      client.gracefulShutdown();
    }

    try {
      console.log("Checking connection to MongoDB...");
      if (mongoose.connection.readyState === 0) {
        console.log("Not connected, attempting to connect to MongoDB...");
        const result = await mongoose.connect(mongodbURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 3000,
        });

        if (result) {
          console.log(
            "Connection successful, The MongoDB Database is running.",
          );

          /*
          if (!sessionId) {
            console.warn("Setup your session ID in .env");
            //client.gracefulShutdown();
          }
          try {
            console.log("Loading session data...");
            const session = await client.loadSessionData(sessionId);
            if (session) {
              console.log("Session data loaded successfully.");
            } else {
              console.warn("No session data found. Starting fresh.");
              client.sessionData = {};
              await client.saveSessionData(sessionId, client.sessionData);
            }
          } catch (error) {
            console.error("Failed to load session data:", error);
          }
          */
        } else {
          console.error("Failed to connect to MongoDB.");
          client.gracefulShutdown();
        }
      } else {
        return console.log(
          "Already connected/connecting to MongoDB, stuck disconnecting or uninitialized.\nreadyState: ",
          mongoose.connection.readyState,
        );
      }
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }

    try {
      console.log("Syncing client guild data...");
      for (const [guildId, guild] of client.guilds.cache) {
        const guildData = await client.syncGuildData(guild);
        if (guildData) {
          console.log(`Synced guild data for guild: ${guild.name}`);
        } else {
          console.warn(`Failed to sync guild data for guild: ${guild.name}`);
        }
      }
    } catch (error) {
      console.error("Error syncing client guild data:", error);
    }

    try {
      await client.guilds.cache.forEach(async (guild) => {
        const clientMember = await guild.members.cache.get(client.user.id);
        if (
          !clientMember.permissions.has(PermissionsBitField.Flags.ManageGuild)
        ) {
          return;
        }

        const firstInvites = await guild.invites.fetch().catch(console.log);
        client.invites.set(
          guild.id,
          new Collection(
            firstInvites.map((invite) => [invite.code, invite.uses]),
          ),
        );
      });
    } catch (error) {
      console.error("Error fetching invites:", error);
    }
  },
};

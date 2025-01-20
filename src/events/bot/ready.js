const { Events, PermissionsBitField, Collection } = require("discord.js");
const mongoose = require("mongoose");
require("dotenv").config({ path: "/home/discord-fkz-1/bot/.env" });
const mongodbURI = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);
mongoose.set("debug", false);

module.exports = {
  name: Events.ClientReady,
  async execute(client) {
    console.log("Ready!");

    if (!mongodbURI) return console.log("Setup mongodbURI in .env");

    try {
      console.log("Checking connection to MongoDB...");
      if (mongoose.connection.readyState === 0) {
        console.log("Not connected, attempting to connect to MongoDB...");
        await mongoose.connect(mongodbURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 3000,
          bufferCommands: false,
        });
      } else {
        return console.log(
          "Already connected/connecting to MongoDB, stuck disconnecting or uninitialized.\nreadyState: ",
          mongoose.connection.readyState
        );
      }

      console.log("The MongoDB Database is running.");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
    await client.guilds.cache.forEach(async (guild) => {
      const clientMember = await guild.members.cache.get(client.user.id);
      if (!clientMember.permissions.has(PermissionsBitField.Flags.ManageGuild))
        return;

      const firstInvites = await guild.invites.fetch().catch(console.log);
      client.invites.set(
        guild.id,
        new Collection(firstInvites.map((invite) => [invite.code, invite.uses]))
      );
    });
  },
};

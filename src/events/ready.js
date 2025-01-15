const { Events, PermissionsBitField, Collection } = require("discord.js");
const mongoose = require("mongoose");
require("dotenv").config();
const mongodbURL = process.env.MONGODB_URL;

client.invites = new Collection();

mongoose.set("strictQuery", false);

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log("Ready!");

    if (!mongodbURL) return console.log("Setup mongodbURL in .env");

    try {
      await mongoose.connect(mongodbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
      });

      console.log("The MongoDB Database is running.");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }

    client.guilds.cache.forEach(async (guild) => {
      const clientMember = guild.members.cache.get(client.user.id);
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

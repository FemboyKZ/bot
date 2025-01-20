const { Events, PermissionsBitField, Collection } = require("discord.js");
const mongoose = require("mongoose");
require("dotenv").config({ path: "/home/discord-fkz-1/bot/.env" });
const mongodbURI = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);
mongoose.set("debug", true);

module.exports = (client) => {
  client.on("ready", async () => {
    console.log("Ready!");

    if (!mongodbURI) return console.log("Setup mongodbURI in .env");

    try {
      await mongoose.connect(mongodbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        //serverSelectionTimeoutMS: 30000,
      });

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
  });
  mongoose.connection.on("connected", () => {
    console.log("Mongoose connection to DB successful");
  });

  mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error: ", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
  });
};

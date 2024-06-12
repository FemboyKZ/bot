const mongoose = require("mongoose");
const mongodbURL = process.env.MONGODB_URL;

mongoose.set("strictQuery", false);

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log("Ready!");

    if (!mongodbURL) return console.log("Setup mongodbURL in .env");

    try {
      await mongoose.connect(mongodbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log("The MongoDB Database is running.");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  },
};

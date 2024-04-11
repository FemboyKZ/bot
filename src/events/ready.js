const mongoose = require("mongoose");
const mongodbURL = process.env.MONGODBURL;

mongoose.set("strictQuery", false);

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log("Ready!");

    if (!mongodbURL) return console.log("Setup mongodbURL in .env");

    await mongoose.connect(mongodbURL || ``, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      keepAlive: true, // deprecated?
    });

    if (mongoose.connect) {
      console.log("The MongoDB Database is running.");
    }
  },
};

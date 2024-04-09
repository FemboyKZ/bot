const mongoose = require("mongoose");
const mongodbURL = process.env.MONGODBURL;

mongoose.set("strictQuery", false);

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log("Ready!");

    if (!mongodbURL) return;

    await mongoose.createConnection(mongodbURL || ``, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      // keepAlive: true, deprecated
    });

    if (mongoose.createConnection) {
      console.log("The MongoDB Database is running.");
    }
  },
};

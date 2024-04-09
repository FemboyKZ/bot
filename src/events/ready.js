const mongoose = require("mongoose");
const mongodbURL = process.env.MONGODBURL;

mongoose.set("strictQuery", false);
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
// mongoose.set('keepAlive', true); deprecated

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log("Ready!");

    if (!mongodbURL) return;

    await mongoose.createConnection(mongodbURL || ``);

    if (mongoose.createConnection) {
      console.log("The MongoDB Database is running.");
    }

    async function pickPresence() {
      const option = Math.floor(Math.random() * statusArray.length);

      try {
        await client.user.setPresence({
          activities: [
            {
              name: statusArray[option].content,
              type: statusArray[option].type,
            },
          ],

          status: statusArray[option].status,
        });
      } catch (error) {
        console.error(error);
      }
    }
  },
};

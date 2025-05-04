const { Events } = require("discord.js");
require("dotenv").config();

module.exports = {
  name: Events.Invalidated,
  async execute(client) {
    console.error("Session invalidated. Attempting to resume...");
    if (client.sessionData.sessionId && client.sessionData.seq) {
      console.log("Resuming session...");
      client.ws.resume(client.sessionData.sessionId, client.sessionData.seq);
    } else {
      console.error("No valid session data. Reconnecting fresh...");
      const retry = (fn, retries = 5, delay = 1000) => {
        return new Promise((resolve, reject) => {
          fn()
            .then(resolve)
            .catch((error) => {
              if (retries > 0) {
                setTimeout(() => {
                  retry(fn, retries - 1, delay * 2)
                    .then(resolve)
                    .catch(reject);
                }, delay);
              } else {
                reject(error);
              }
            });
        });
      };
      console.log("Attempting to reconnect...");
      retry(() => client.login(process.env.TOKEN))
        .then(() => console.log("Logged in successfully"))
        .catch((error) => {
          console.error("Failed to log in after retries:", error);
        });
    }
  },
};

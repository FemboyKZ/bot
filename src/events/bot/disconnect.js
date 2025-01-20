require("dotenv").config();

module.exports = {
  name: "disconnect",
  async execute(client) {
    console.log("Disconnected from Discord API");
    const retry = (fn, retries = 3, timeout = 1000) => {
      return new Promise((resolve, reject) => {
        fn()
          .then(resolve)
          .catch((error) => {
            if (retries > 0) {
              setTimeout(() => {
                retry(fn, retries - 1, timeout)
                  .then(resolve)
                  .catch(reject);
              }, timeout);
            } else {
              reject(error);
            }
          });
      });
    };
    console.log("Attempting to reconnect...");
    retry(() => client.login(process.env.TOKEN))
      .then(() => console.log("Logged in successfully"))
      .catch((error) => console.error("Failed to log in:", error));
  },
};

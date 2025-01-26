module.exports = {
  name: "SIGINT",
  async execute(client) {
    console.log("Received SIGINT. Performing graceful shutdown...");
    client.gracefulShutdown().catch(console.error);
  },
};

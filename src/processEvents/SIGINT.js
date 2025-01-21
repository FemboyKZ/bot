module.exports = {
  name: "SIGINT",
  async execute(client) {
    console.log("\nReceived SIGINT. Performing graceful shutdown...");
    client.gracefulShutdown().catch(console.error);
  },
};

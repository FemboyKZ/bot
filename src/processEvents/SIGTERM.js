module.exports = {
  name: "SIGTERM",
  async execute(client) {
    console.log("\nReceived SIGTERM. Performing graceful shutdown...");
    client.gracefulShutdown().catch(console.error);
  },
};

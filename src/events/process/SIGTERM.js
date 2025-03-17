module.exports = {
  name: "SIGTERM",
  async execute(client) {
    console.log("Received SIGTERM. Performing graceful shutdown...");
    client.gracefulShutdown().catch(console.error);
  },
};

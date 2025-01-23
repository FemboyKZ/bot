module.exports = {
  name: "unhandledRejection",
  async execute(reason, promise, client) {
    console.warn("Unhandled Rejection at:", promise, "reason:", reason);
  },
};

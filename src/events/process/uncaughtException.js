module.exports = {
  name: "uncaughtException",
  async execute(err, client) {
    console.error("Uncaught exception:", err);
  },
};

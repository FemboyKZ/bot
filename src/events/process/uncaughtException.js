module.exports = {
  name: "uncaughtException",
  async execute(err, client) {
    console.error("Unhandled exception:", err);
  },
};

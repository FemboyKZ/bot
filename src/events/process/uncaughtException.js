module.exports = {
  name: "uncaughtException",
  async execute(err, origin, _client) {
    console.error("Uncaught Exception! Error: ", err, "\nOrigin: ", origin);
  },
};

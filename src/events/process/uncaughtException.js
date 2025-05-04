module.exports = {
  name: "uncaughtException",
  async execute(err, origin, client) {
    console.error("Uncaught Exception! Error: ", err, "\nOrigin: ", origin);
  },
};

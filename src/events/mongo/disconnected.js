module.exports = {
  name: "disconnected",
  async execute(_client) {
    console.warn("Disconnected from MongoDB.");
  },
};

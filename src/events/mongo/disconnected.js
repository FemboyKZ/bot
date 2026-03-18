module.exports = {
  name: "disconnected",
  async execute(client) {
    console.warn("Disconnected from MongoDB.");
  },
};

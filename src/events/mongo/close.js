module.exports = {
  name: "close",
  async execute(client) {
    console.warn("MongoDB connection closed.");
  },
};

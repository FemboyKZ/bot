module.exports = {
  name: "close",
  async execute(_client) {
    console.warn("MongoDB connection closed.");
  },
};

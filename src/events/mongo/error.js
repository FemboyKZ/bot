module.exports = {
  name: "error",
  async execute(error, _client) {
    console.error("MongoDB connection error: ", error);
  },
};

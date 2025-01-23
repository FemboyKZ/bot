module.exports = {
  name: "error",
  async execute(error, client) {
    console.error("MongoDB connection error:", error);
  },
};

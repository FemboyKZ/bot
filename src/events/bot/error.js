module.exports = {
  name: "error",
  async execute(error, client) {
    console.error("Error occurred:", error);
  },
};

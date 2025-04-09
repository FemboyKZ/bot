module.exports = {
  name: "warning",
  async execute(warning, client) {
    console.warn("Warning: ", warning);
  },
};

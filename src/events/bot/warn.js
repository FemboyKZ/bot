module.exports = {
  name: "warn",
  async execute(warning, client) {
    console.warn("Warning occurred:", warning);
  },
};

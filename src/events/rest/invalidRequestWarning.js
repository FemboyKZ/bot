module.exports = {
  name: "invalidRequestWarning",
  async execute(info, client) {
    console.warn(`Invalid request warning: ${JSON.stringify(info)}`);
  },
};

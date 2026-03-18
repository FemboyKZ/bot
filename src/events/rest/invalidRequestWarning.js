module.exports = {
  name: "invalidRequestWarning",
  async execute(info, _client) {
    console.warn("Invalid request warning: ", info);
  },
};

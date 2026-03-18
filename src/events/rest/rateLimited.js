module.exports = {
  name: "rateLimited",
  async execute(info, _client) {
    console.warn("Rate limit hit: ", info);
  },
};

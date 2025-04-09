module.exports = {
  name: "rateLimited",
  async execute(info, client) {
    console.warn("Rate limit hit: ", info);
  },
};

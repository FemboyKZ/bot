module.exports = {
  name: "rateLimited",
  async execute(info, client) {
    console.warn(`Rate limit hit: ${JSON.stringify(info)}`);
  },
};

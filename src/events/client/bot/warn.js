const { Events } = require("discord.js");

module.exports = {
  name: Events.Warn,
  async execute(message, _client) {
    console.warn("Warning occurred:", message);
  },
};

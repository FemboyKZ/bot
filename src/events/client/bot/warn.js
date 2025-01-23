const { Events } = require("discord.js");

module.exports = {
  name: Events.Warn,
  async execute(message, client) {
    console.warn("Warning occurred:", message);
  },
};

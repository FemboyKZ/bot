const { Events } = require("discord.js");

module.exports = {
  name: Events.CacheSweep,
  async execute(message, _client) {
    // `message` is a human-readable summary of what was swept.
    console.log(`[cache sweep] ${message}`);
  },
};

const { Events } = require("discord.js");

module.exports = {
  name: Events.Debug,
  async execute(_message, _client) {
    //console.debug("Debug data:", message);
  },
};

const { Events } = require("discord.js");

module.exports = {
  name: Events.Debug,
  async execute(message, client) {
    //console.debug("Debug data:", message);
  },
};

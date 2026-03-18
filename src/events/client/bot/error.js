const { Events } = require("discord.js");

module.exports = {
  name: Events.Error,
  async execute(error, _client) {
    console.error("Error occurred:", error);
  },
};

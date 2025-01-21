const { Events } = require("discord.js");

module.exports = {
  name: Events.Error,
  async execute(error, client) {
    console.error("Error occurred:", error);
  },
};

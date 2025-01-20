const { Events } = require("discord.js");

module.exports = {
  name: Events.MessageReactionRemoveAll,
  async execute(reaction, user, client) {
    // Kinda pointless
    // TODO: Implement this event handler
    return;
  },
};

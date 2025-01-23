const { Events } = require("discord.js");

module.exports = {
  name: Events.Raw,
  async execute(packet, client) {
    /*
    if (packet.t) {
      if (client.ws && typeof client.ws.sequence !== "undefined") {
        client.sessionData.seq = client.ws.sequence;
        await client.saveSessionData(
          client.sessionData.sessionId,
          client.sessionData
        );
      } else {
        //console.error("client.ws or client.ws.sequence is undefined");
      }
    }
    */
  },
};

export default (client) => {
  client.handleEvents = async (eventFiles, eventsPath) => {
    if (!Array.isArray(eventFiles) || !eventsPath) {
      throw new Error("Invalid eventFiles or eventsPath");
    }

    for (const eventFile of eventFiles) {
      if (typeof eventFile !== "string") {
        throw new Error(`Invalid eventFile: ${eventFile}`);
      }

      const eventPath = `${eventsPath}/${eventFile}`;
      const event = require(eventPath);

      if (!event.execute || typeof event.execute !== "function") {
        throw new Error(`Event '${eventFile}' is missing execute function`);
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    }
  };
};

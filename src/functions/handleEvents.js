const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.handleEvents = async (eventsPath) => {
    const loadDir = (dir) => {
      const files = fs.readdirSync(path.join(eventsPath, dir));
      for (const file of files) {
        const fullPath = path.join(eventsPath, dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          loadDir(path.join(dir, file));
        } else {
          try {
            const event = require(fullPath);

            if (!event.name || !event.execute) {
              console.error(`Invalid event file: ${event.name}`);
              continue;
            }

            if (event.once) {
              client.once(event.name, (...args) =>
                event.execute(...args, client),
              );
            } else {
              client.on(event.name, (...args) =>
                event.execute(...args, client),
              );
            }
          } catch (error) {
            console.error(`Error loading event file`, error);
          }
        }
      }
    };
    loadDir(".");
  };
};

const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.handleRestEvents = async (restEventsPath) => {
    const loadDir = (dir) => {
      const files = fs.readdirSync(path.join(restEventsPath, dir));
      for (const file of files) {
        const fullPath = path.join(restEventsPath, dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          loadDir(path.join(dir, file));
        } else {
          try {
            const event = require(fullPath);

            if (!event.name || !event.execute) {
              console.error(`Invalid event file: ${fullPath}`);
              continue;
            }

            if (event.once) {
              client.rest.once(event.name, (...args) =>
                event.execute(...args, client)
              );
            } else {
              client.rest.on(event.name, (...args) =>
                event.execute(...args, client)
              );
            }
          } catch (error) {
            console.error(`Error loading event file ${fullPath}:`, error);
          }
        }
      }
    };
    loadDir(".");
  };
};

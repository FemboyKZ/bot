const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

module.exports = (client) => {
  client.handleMongoEvents = async (eventsPath) => {
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
              console.error(`Invalid mongo event file: ${event.name}`);
              continue;
            }

            mongoose.connection.on(event.name, (...args) =>
              event.execute(client, ...args),
            );
          } catch (error) {
            console.error(`Error loading mongo event file:`, error);
          }
        }
      }
    };
    loadDir(".");
  };
};

const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.handleProcessEvents = async (eventsPath) => {
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
              console.error(`Invalid process event file: ${fullPath}`);
              continue;
            }

            if (event.execute) {
              process.on(event.name, (...args) =>
                event.execute(client, ...args)
              );
            } else {
              console.warn(
                `Event file ${file} is missing an execute function.`
              );
            }
          } catch (error) {
            console.error(
              `Error loading process event file ${fullPath}:`,
              error
            );
          }
        }
      }
    };
    loadDir(".");
  };
};

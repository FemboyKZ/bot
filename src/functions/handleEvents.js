const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.handleEvents = async (eventsPath) => {
    const loadDir = (dir) => {
      const files = fs.readdirSync(path.join(eventsPath, dir));
      for (const file of files) {
        const stat = fs.statSync(path.join(eventsPath, dir, file));
        if (stat.isDirectory()) {
          loadDir(path.join(dir, file));
        } else {
          const event = require(path.join(eventsPath, dir, file));
          if (event.once) {
            client.once(event.name, (...args) =>
              event.execute(...args, client)
            );
          } else {
            client.on(event.name, (...args) => event.execute(...args, client));
          }
        }
      }
    };
    loadDir(".");
  };
};

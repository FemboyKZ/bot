module.exports = (client) => {
  client.handleProcessEvents = async (processEventFiles, path) => {
    for (const file of processEventFiles) {
      const event = require(`${path}/${file}`);
      if (event.execute) {
        process.on(event.name, (...args) => event.execute(client, ...args));
      } else {
        console.warn(`Event file ${file} is missing an execute function.`);
      }
    }
  };
};

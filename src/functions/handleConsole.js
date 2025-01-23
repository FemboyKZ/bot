const EventEmitter = require("events");

class ConsoleHandler extends EventEmitter {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.originalConsoleLog = console.log;
    this.originalConsoleWarn = console.warn;
    this.originalConsoleError = console.error;

    console.log = (...args) => {
      this.handleConsoleEvent("log", args);
      this.originalConsoleLog(...args);
    };
    console.warn = (...args) => {
      this.handleConsoleEvent("warn", args);
      this.originalConsoleWarn(...args);
    };
    console.error = (...args) => {
      this.handleConsoleEvent("error", args);
      this.originalConsoleError(...args);
    };
  }

  handleConsoleEvent(type, args) {
    const timestamp = new Date().toISOString();
    const eventData = { type, timestamp, message: args };

    this.emit("console", eventData);
    this.logToFile(eventData);
  }

  logToFile(eventData) {
    const fs = require("fs");
    const logMessage = `[${
      eventData.timestamp
    }] [${eventData.type.toUpperCase()}]: ${eventData.message.join(" ")}\n`;
    fs.appendFileSync("console.log", logMessage);
  }
}

module.exports = new ConsoleHandler();

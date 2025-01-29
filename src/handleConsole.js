const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");

class ConsoleHandler extends EventEmitter {
  constructor() {
    super();
    this.init();
  }

  async init() {
    this.originalConsoleLog = console.log;
    this.originalConsoleWarn = console.warn;
    this.originalConsoleError = console.error;

    console.log = async (...args) => {
      this.handleConsoleEvent("log", args);
      this.originalConsoleLog(`${await this.getCurrentTimestamp()} |`, ...args);
    };
    console.warn = async (...args) => {
      this.handleConsoleEvent("warn", args);
      this.originalConsoleWarn(
        `${await this.getCurrentTimestamp()} |`,
        ...args,
      );
    };
    console.error = async (...args) => {
      this.handleConsoleEvent("error", args);
      this.originalConsoleError(
        `${await this.getCurrentTimestamp()} |`,
        ...args,
      );
    };
  }

  async handleConsoleEvent(type, args) {
    const timestamp = new Date().toISOString();
    const eventData = { type, timestamp, message: args };

    this.emit("console", eventData);
    this.logToFile(eventData);
  }

  async getCurrentTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  async logToFile(eventData) {
    const logDir = path.join(__dirname, "..", "logs");

    const date = new Date().toISOString().split("T")[0];
    const logFilePath = path.join(logDir, `log_${date}.txt`);

    if (!fs.existsSync(logDir)) {
      try {
        this.originalConsoleLog(`Creating log directory: ${logDir}`);
        fs.mkdirSync(logDir);
      } catch (error) {
        this.originalConsoleError(
          `Error creating log directory: ${logDir}`,
          error,
        );
        return;
      }
    }

    const logMessage = `[${await this.getCurrentTimestamp()}] [${eventData.type.toUpperCase()}]: ${eventData.message}\n`;
    try {
      fs.appendFileSync(logFilePath, logMessage);
    } catch (error) {
      this.originalConsoleError(
        `Error writing to log file: ${logFilePath}`,
        error,
      );
    }
  }
}

module.exports = new ConsoleHandler();

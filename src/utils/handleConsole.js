const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");

class ConsoleHandler extends EventEmitter {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.originalConsoleLog = console.log;
    this.originalConsoleWarn = console.warn;
    this.originalConsoleError = console.error;

    const override =
      (type, original) =>
      (...args) => {
        const timestamp = this.getCurrentTimestamp();
        this.handleConsoleEvent(type, args);
        original(`${timestamp} |`, ...args);
      };

    console.log = override("log", this.originalConsoleLog);
    console.warn = override("warn", this.originalConsoleWarn);
    console.error = override("error", this.originalConsoleError);
  }

  handleConsoleEvent(type, args) {
    const timestamp = new Date().toISOString();
    const eventData = { type, timestamp, message: args };
    this.emit("console", eventData);
    this.logToFile(eventData);
  }

  getCurrentTimestamp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  logToFile(eventData) {
    const logDir = path.join(__dirname, "..", "logs");
    const date = new Date().toISOString().split("T")[0];
    const logFilePath = path.join(logDir, `log_${date}.txt`);

    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logMessage = `[${this.getCurrentTimestamp()}] [${eventData.type.toUpperCase()}]: ${eventData.message.join(" ")}\n`;
      fs.appendFileSync(logFilePath, logMessage);
    } catch (error) {
      this.originalConsoleError(`Logging error:`, error);
    }
  }
}

module.exports = new ConsoleHandler();

const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");
const util = require("util");

class ConsoleHandler extends EventEmitter {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.originalConsoleLog = console.log;
    this.originalConsoleWarn = console.warn;
    this.originalConsoleError = console.error;
    this.originalConsoleDebug = console.debug;

    const override =
      (type, original) =>
      (...args) => {
        const now = new Date();
        const timestampConsole = this.formatConsoleTimestamp(now);
        const timestampISO = now.toISOString();
        this.handleConsoleEvent(type, args, timestampISO);
        original(`${timestampConsole} |`, ...args);
      };

    console.log = override("log", this.originalConsoleLog);
    console.warn = override("warn", this.originalConsoleWarn);
    console.error = override("error", this.originalConsoleError);
    console.debug = override("debug", this.originalConsoleDebug);
  }

  handleConsoleEvent(type, args, timestamp) {
    const eventData = { type, timestamp, message: args };
    this.emit("console", eventData);
    this.logToFile(eventData);
  }

  formatConsoleTimestamp(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  formatLogTimestamp(date) {
    const pad = (n, length = 2) => String(n).padStart(length, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
  }

  logToFile(eventData) {
    const logDir = path.join(__dirname, "..", "..", "logs");
    const logDate = new Date(eventData.timestamp);
    const logFileNameDate = logDate.toISOString().split("T")[0];
    const logFilePath = path.join(logDir, `log_${logFileNameDate}.txt`);

    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const formattedLogTimestamp = this.formatLogTimestamp(logDate);
      const messages = eventData.message
        .map((arg) =>
          util.inspect(arg, { depth: null, colors: false, showHidden: false }),
        )
        .join(" ");

      const logMessage = `[${formattedLogTimestamp}] [${eventData.type.toUpperCase()}]: ${messages}\n`;
      fs.appendFileSync(logFilePath, logMessage);
    } catch (error) {
      this.originalConsoleError("Logging error:", error);
    }
  }
}

module.exports = new ConsoleHandler();

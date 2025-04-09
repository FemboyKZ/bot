module.exports = {
  name: "warning",
  async execute(warning, client) {
    console.warn(
      "Warning: ",
      warning.name || "Unknown",
      "Message: ",
      warning.message || "Unknown",
      "\nStack: ",
      warning.stack || "None",
    );
  },
};

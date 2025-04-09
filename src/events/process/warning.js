module.exports = {
  name: "warning",
  async execute(warning, client) {
    if (!warning || (!warning.name && !warning.message && !warning.stack)) {
      return;
    }
    console.warn(
      `Warning: ${warning.name} - ${warning.message} - Stack: ${warning.stack}`,
    );
  },
};

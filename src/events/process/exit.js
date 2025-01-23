module.exports = {
  name: "exit",
  async execute(code, client) {
    console.log(`Process exiting with code ${code}`);
  },
};

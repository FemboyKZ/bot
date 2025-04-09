module.exports = {
  name: "beforeExit",
  async execute(code, client) {
    console.log(`Process beforeExit event with code: ${code}`);
  },
};

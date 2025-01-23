module.exports = {
  name: "exit",
  async execute(info, client) {
    console.log(`Exit: ${JSON.stringify(info)}`);
  },
};

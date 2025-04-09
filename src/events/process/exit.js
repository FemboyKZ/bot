module.exports = {
  name: "exit",
  async execute(code, client) {
    console.log(`Process exit event with code: ${code}`);
  },
};

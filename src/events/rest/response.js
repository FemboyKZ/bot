module.exports = {
  name: "response",
  async execute(request, response, client) {
    console.log(`API response: ${response.status}`);
  },
};

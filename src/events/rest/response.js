module.exports = {
  name: "response",
  async execute(request, response, client) {
    if (!response.status === 200) {
      console.warn(
        `Response status not 200, response: ${JSON.stringify(response)}`,
      );
    }
  },
};

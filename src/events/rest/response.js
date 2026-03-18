module.exports = {
  name: "response",
  async execute(request, response, _client) {
    if (response.status !== 200) {
      console.warn(
        "Request response status not 200, request: ",
        request,
        "\nResponse: ",
        response,
      );
    }
  },
};

module.exports = {
  name: "response",
  async execute(request, response, _client) {
    if (!response.ok) {
      console.warn(
        "Request response status not 200, request: ",
        request,
        "\nResponse: ",
        response,
      );
    }
  },
};

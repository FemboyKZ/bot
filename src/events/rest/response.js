module.exports = {
  name: "response",
  async execute(request, response, client) {
    if (!response.status === 200) {
      console.warn(
        "Request response status not 200, request: ",
        request,
        "\nResponse: ",
        response,
      );
    }
  },
};

module.exports = {
  name: "unhandledRejection",
  async execute(reason, promise, client) {
    console.error(
      `Unhandled Rejection! - Promise: ${promise} - Reason: ${reason}`,
    );
  },
};

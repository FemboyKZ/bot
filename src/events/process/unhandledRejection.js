module.exports = {
  name: "unhandledRejection",
  async execute(reason, promise, client) {
    let reasonDetails;
    if (reason && reason.message) {
      reasonDetails = reason.message;
    } else if (reason && reason.stack) {
      reasonDetails = reason.stack;
    } else {
      try {
        reasonDetails = JSON.stringify(reason);
      } catch (error) {
        reasonDetails = "Unknown reason (failed to stringify)";
      }
    }

    console.error(
      `Unhandled Rejection!\nPromise: ${promise}\nReason: ${reasonDetails}`,
    );
  },
};

/**
 * Simple per-user in-memory cooldown.
 *
 * @param {number} ms cooldown window in milliseconds
 */
function createCooldown(ms = 10000) {
  const users = new Set();
  return {
    /** @returns {boolean} true if the user is on cooldown (caller should bail) */
    hit(userId) {
      if (users.has(userId)) return true;
      users.add(userId);
      setTimeout(() => users.delete(userId), ms);
      return false;
    },
  };
}

module.exports = { createCooldown };

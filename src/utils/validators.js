// Minecaft validators

function isValidMinecraftUUID(uuid) {
  const uuidRegex =
    /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Steam validators

function isValidSteamID(steamId) {
  if (typeof steamId !== "string") return false;

  steamId = steamId.trim();

  if (steamId.includes("steamcommunity.com")) {
    const urlResult = extractSteamIdFromUrl(steamId);
    if (urlResult === "custom_id") {
      return "custom_id";
    }
    if (urlResult) {
      steamId = urlResult;
    }
  }

  // SteamID64 format (17-18 digits starting with 76561)
  const steamid64Regex = /^76561[0-9]{12,13}$/;
  if (steamid64Regex.test(steamId)) {
    return true;
  }

  // SteamID2 format STEAM_X:Y:Z
  const steamid2Regex = /^STEAM_[0-5]:[01]:[0-9]+$/;
  if (steamid2Regex.test(steamId.toUpperCase())) {
    return true;
  }

  // SteamID3 format [U:1:XXXXXXXXX]
  const steamid3Regex = /^\[U:1:[0-9]+\]$/;
  if (steamid3Regex.test(steamId)) {
    return true;
  }

  return false;
}

/**
 * Convert any SteamID format to SteamID64
 *
 * Supports:
 * - SteamID64: "76561198000000000" (returns as-is)
 * - SteamID2: "STEAM_0:1:12345" or "STEAM_1:0:12345"
 * - SteamID3: "[U:1:24691]"
 *
 * Algorithm:
 * SteamID64 = 76561197960265728 + (Z * 2) + Y
 * Where STEAM_X:Y:Z -> Y and Z are extracted
 *
 * @param {string} steamid - Any valid SteamID format
 * @returns {string|null} SteamID64 format or null if invalid
 */
function convertToSteamID64(steamid) {
  if (!steamid || typeof steamid !== "string") return null;

  // Already SteamID64 format (17-18 digits starting with 76561)
  if (/^76561[0-9]{12,13}$/.test(steamid)) {
    return steamid;
  }

  // SteamID2 format: STEAM_X:Y:Z
  const steamid2Match = steamid.match(/^STEAM_[0-5]:([01]):([0-9]+)$/);
  if (steamid2Match) {
    const Y = parseInt(steamid2Match[1], 10);
    const Z = parseInt(steamid2Match[2], 10);
    const accountID = Z * 2 + Y;
    const steamID64 = BigInt("76561197960265728") + BigInt(accountID);
    return steamID64.toString();
  }

  // SteamID3 format: [U:1:XXXXXXXXX]
  const steamid3Match = steamid.match(/^\[U:1:([0-9]+)\]$/);
  if (steamid3Match) {
    const accountID = parseInt(steamid3Match[1], 10);
    const steamID64 = BigInt("76561197960265728") + BigInt(accountID);
    return steamID64.toString();
  }

  return null;
}

function extractSteamIdFromUrl(url) {
  try {
    const profileRegex = /steamcommunity\.com\/profiles\/(7656119\d{10})/;
    const profileMatch = url.match(profileRegex);
    if (profileMatch) {
      return profileMatch[1];
    }

    const customRegex = /steamcommunity\.com\/id\/([a-zA-Z0-9_-]+)/;
    const customMatch = url.match(customRegex);
    if (customMatch) {
      return "custom_id";
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Ip validators

function isValidIP(ip) {
  // IPv4 validation
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6 validation (basic)
  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function isValidPort(port) {
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
}

// Sanitizers

function sanitizeString(str, maxLength = 255) {
  if (typeof str !== "string") return "";
  return str.trim().substring(0, maxLength);
}

/**
 * Sanitize player name by removing control characters and invisible formatting
 * while preserving visible Unicode symbols (hearts, emojis, etc.)
 *
 * CS:GO/CS2 player names can contain:
 * - Color codes (\x01-\x1F control characters) - REMOVE
 * - Unicode invisible formatting (U+2067, zero-width, etc.) - REMOVE
 * - Unicode visible symbols (♥, ★, emojis, etc.) - KEEP
 * - Non-ASCII text (Cyrillic, Chinese, etc.) - KEEP
 *
 * Examples:
 *   "ily⁧⁧♥" -> "ily♥" (removes U+2067, keeps heart)
 *   "Player\x07Name" -> "PlayerName" (removes color code)
 *   "Test★Name" -> "Test★Name" (keeps star)
 *
 * @param {string} playerName - Raw player name from RCON
 * @returns {string|null} Sanitized player name or null if empty/invalid
 */
function sanitizePlayerName(playerName) {
  if (!playerName || typeof playerName !== "string") return null;

  // Step 1: Remove ASCII control characters (0x00-0x1F and 0x7F)
  // These are CS:GO/CS2 color codes and formatting
  // eslint-disable-next-line no-control-regex
  let cleaned = playerName.replace(/[\x00-\x1F\x7F]/g, "");

  // Step 2: Remove Unicode invisible/formatting characters but KEEP visible symbols
  // Remove: Zero-width spaces, joiners, directional marks, variation selectors, tags, etc.
  // Keep: Hearts (♥), stars (★), emojis, and other visible Unicode
  cleaned = cleaned.replace(
    // eslint-disable-next-line no-misleading-character-class
    /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFFB\u{E0000}-\u{E007F}]/gu,
    "",
  );

  // Step 3: Normalize whitespace (replace multiple spaces/newlines with single space)
  cleaned = cleaned.replace(/\s+/g, " ");

  // Step 4: Trim and check if anything remains
  cleaned = cleaned.trim();

  // Return null if the name is empty after sanitization
  return cleaned.length > 0 ? cleaned : null;
}

module.exports = {
  isValidMinecraftUUID,
  isValidSteamID,
  convertToSteamID64,
  extractSteamIdFromUrl,
  isValidIP,
  isValidPort,
  sanitizeString,
  sanitizePlayerName,
};

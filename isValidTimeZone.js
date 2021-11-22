/**
 * Checks if a string is a valid timezone or not
 *
 * @param {string} timezone the time zone string, e.g UTC or America/Los_Angeles
 * @returns {boolean} if the timezone is valid
 */
function isValidTimeZone(timezone) {
  if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
    throw new Error("Time zones are not available in this environment");
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (ex) {
    return false;
  }
}

module.exports = {
  isValidTimeZone,
};

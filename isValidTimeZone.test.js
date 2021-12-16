const { isValidTimeZone } = require("./isValidTimeZone.js");

test.each([
  ["UTC", true],
  ["GMT", true],
  ["Greenwich Mean Time", false], // Only "zzz" format is supported in CEF, not "zzzz"
  ["EEST", false],
  ["ABC", false],
])("Valid timezone", (timezone, valid) => {
  let actualValid = isValidTimeZone(timezone);

  expect(actualValid).toBe(valid);
});

const assert = require("node:assert/strict");
const { validateEnvironment } = require("../dist/config/env.validation");

assert.throws(
  () => validateEnvironment({ NODE_ENV: "production", MONGODB_URI: "mongodb://localhost/test" }),
  /JWT_SECRET/
);

assert.throws(
  () =>
    validateEnvironment({
      NODE_ENV: "production",
      MONGODB_URI: "mongodb://localhost/test",
      JWT_SECRET: "x".repeat(32),
    }),
  /CORS_ORIGINS/
);

const valid = validateEnvironment({
  NODE_ENV: "production",
  MONGODB_URI: "mongodb://localhost/test",
  JWT_SECRET: "x".repeat(32),
  CORS_ORIGINS: "https://crm.example.com",
});
assert.equal(valid.MONGO_DB, "promath_crm");

console.log("environment validation passed");

const isProduction = (env: Record<string, unknown>) => env.NODE_ENV === "production";

export function validateEnvironment(input: Record<string, unknown>) {
  const env = { ...input } as Record<string, string | undefined>;
  const mongoUri = env.MONGODB_URI ?? env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }
  if (isProduction(input)) {
    if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters in production");
    }
    if (!env.CORS_ORIGINS) {
      throw new Error("CORS_ORIGINS is required in production");
    }
  }
  if (!env.JWT_SECRET) {
    env.JWT_SECRET = "development-only-secret-change-before-production";
  }
  env.MONGODB_URI = mongoUri;
  env.MONGO_DB = env.MONGO_DB ?? "promath_crm";
  env.JWT_EXPIRES_IN = env.JWT_EXPIRES_IN ?? "8h";
  return env;
}

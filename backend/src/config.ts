import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16, "JWT_SECRET should be at least 16 characters"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(16, "REFRESH_TOKEN_SECRET should be at least 16 characters"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  REMEMBER_REFRESH_TOKEN_EXPIRES_IN: z.string().default("30d"),
  CORS_ORIGINS: z.preprocess((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string")
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    return [];
  }, z.array(z.string().url())),
});

const rawEnv = {
  PORT: process.env.PORT ?? Bun.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL ?? Bun.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET ?? Bun.env.JWT_SECRET,
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET ?? Bun.env.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN:
    process.env.ACCESS_TOKEN_EXPIRES_IN ?? Bun.env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN:
    process.env.REFRESH_TOKEN_EXPIRES_IN ?? Bun.env.REFRESH_TOKEN_EXPIRES_IN,
  REMEMBER_REFRESH_TOKEN_EXPIRES_IN:
    process.env.REMEMBER_REFRESH_TOKEN_EXPIRES_IN ??
    Bun.env.REMEMBER_REFRESH_TOKEN_EXPIRES_IN,
  CORS_ORIGINS: process.env.CORS_ORIGINS ?? Bun.env.CORS_ORIGINS,
};

export type AppConfig = z.infer<typeof envSchema>;

export const config: AppConfig = envSchema.parse(rawEnv);

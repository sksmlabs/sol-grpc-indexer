import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

const redactPaths: string[] = [
  "process.env.GRPC_TOKEN",
  "*.password",
  "*.secret",
  "*.token",
  "*.authorization",
  "DATABASE_URL",
];

const baseOptions = {
  level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  base: {
    service: "sol-grpc-indexer",
    env: process.env.NODE_ENV ?? "dev",
    version: process.env.npm_package_version,
  },
  redact: {
    paths: redactPaths,
    remove: true,
  },
};

export const logger = isProd
  ? pino(baseOptions)
  : pino({
      ...baseOptions,
      transport: {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
      },
    });

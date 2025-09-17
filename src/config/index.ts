import dotenv from "dotenv";
import { logger } from "../../logs/log";
import { E } from "../../logs/log-events";

dotenv.config();


function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    logger.fatal({ event: E.ENV_MISSING, envVar: name }, "Missing required env var");
    process.exit(1);
  }
  logger.debug({ event: E.ENV_OK, envVar: name }, "Env var loaded");
  return value;
}

export const GRPC_ENDPOINT: string = requireEnv("GRPC_ENDPOINT");
export const GRPC_TOKEN: string | undefined = process.env.GRPC_TOKEN;

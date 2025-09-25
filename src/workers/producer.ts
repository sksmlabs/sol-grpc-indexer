// src/services/producer.ts
import { YellowStoneClient } from "../grpc/client";
import {
  createSlotSubscription,
  createPingSubscription,
  createTokenSubscription,
  createSolTransferSubscription,
} from "../grpc/subReqs";
import { ensureTopics } from "../kafka/admin";
import { logger } from "../logs/log";
import { E } from "../logs/log-events";

const MODE = process.env.MODE ?? "slot";       // e.g. "sol", "slot", "ping", "token"
const TOKEN = process.env.TOKEN;               // only used if MODE="token"

function getFactory(): () => any {
  switch (MODE) {
    case "slot":
      return createSlotSubscription;
    case "ping":
      return createPingSubscription;
    case "sol":
      return createSolTransferSubscription;
    case "token":
      if (!TOKEN) throw new Error("TOKEN env must be set when MODE=token");
      const map: Record<string, string> = {
        usdc: process.env.USDC_MINT ?? "",
        usdt: process.env.USDT_MINT ?? "",
        wsol: process.env.WSOL_MINT ?? "",
      };
      const mint = map[TOKEN.toLowerCase()];
      if (!mint) throw new Error(`Unknown token "${TOKEN}"`);
      return () => createTokenSubscription([mint]);
    default:
      throw new Error(`Unknown MODE "${MODE}"`);
  }
}

async function main() {
  logger.info({ event: E.APP_START, mode: MODE, token: TOKEN }, "Producer startup");

  await ensureTopics();

  const client = new YellowStoneClient();
  client.getVersion();

  const factory = getFactory();
  await client.connect(factory());

  logger.info({ event: E.APP_READY }, "Producer running");

  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
}

main().catch((err) => {
  logger.error({ event: E.APP_FATAL, err: String(err) }, "Fatal producer error");
  process.exit(1);
});
